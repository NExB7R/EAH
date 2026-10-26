'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/logging/audit'

// ═══════════════════════════════════════════════════════════════════
// Merchant: toggle offline_mode (temporary unavailable — no penalty)
// ═══════════════════════════════════════════════════════════════════

type Result = { ok: true } | { ok: false; error: string }

export async function setOfflineMode(offline: boolean, untilIso?: string): Promise<Result> {
  if (typeof offline !== 'boolean') return { ok: false, error: 'اختيار غير صحيح' }
  if (untilIso !== undefined && typeof untilIso !== 'string') {
    return { ok: false, error: 'وقت غير صحيح' }
  }
  if (offline && !untilIso) {
    return { ok: false, error: 'حدد مدة التوقف قبل تأكيد القفل' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول' }

  const { data: biz } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'مفيش نشاط مرتبط بحسابك' }
  const { data: settings, error: settingsError } = await supabase
    .from('merchant_order_settings')
    .select('admin_enabled')
    .eq('business_id', biz.id)
    .maybeSingle()
  if (settingsError) return { ok: false, error: 'تعذر قراءة إعدادات الطلبات' }
  if (!settings?.admin_enabled) {
    return { ok: false, error: 'الإدارة لازم تفعّل استقبال الطلبات الأول' }
  }

  // Validate offline_until (must be future if provided)
  let offlineUntil: string | null = null
  if (offline && untilIso) {
    const target = new Date(untilIso).getTime()
    if (!Number.isFinite(target) || target <= Date.now()) {
      return { ok: false, error: 'وقت غير صحيح' }
    }
    // Cap at 7 days
    const maxAhead = Date.now() + 7 * 24 * 60 * 60 * 1000
    offlineUntil = new Date(Math.min(target, maxAhead)).toISOString()
  }

  const { error } = await supabase
    .from('merchant_order_settings')
    .update({
      offline_mode: offline,
      offline_until: offline ? offlineUntil : null,
      updated_at: new Date().toISOString(),
    })
    .eq('business_id', biz.id)

  if (error) return { ok: false, error: 'فشل التحديث' }

  await logAudit(supabase, {
    actorUserId: user.id,
    action: offline ? 'orders.offline_on' : 'orders.offline_off',
    entityType: 'business',
    entityId: biz.id,
    metadata: { offline_until: offlineUntil },
  })

  revalidatePath('/merchant/orders/settings')
  revalidatePath('/merchant/orders')
  return { ok: true }
}

export async function setDeliveryEta(etaMinutes: number): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول' }

  if (!Number.isInteger(etaMinutes) || etaMinutes < 15 || etaMinutes > 240) {
    return { ok: false, error: 'مدة التسليم لازم تكون من 15 لـ 240 دقيقة' }
  }
  const safeEta = etaMinutes

  const { data: biz } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'مفيش نشاط مرتبط بحسابك' }
  const { data: current, error: currentError } = await supabase
    .from('merchant_order_settings')
    .select('admin_enabled')
    .eq('business_id', biz.id)
    .maybeSingle()
  if (currentError) return { ok: false, error: 'تعذر قراءة إعدادات الطلبات' }
  if (!current?.admin_enabled) {
    return { ok: false, error: 'الإدارة لازم تفعّل استقبال الطلبات الأول' }
  }

  const { error } = await supabase
    .from('merchant_order_settings')
    .update({
      delivery_eta_minutes: safeEta,
      updated_at: new Date().toISOString(),
    })
    .eq('business_id', biz.id)

  if (error) return { ok: false, error: 'فشل التحديث' }

  await logAudit(supabase, {
    actorUserId: user.id,
    action: 'orders.eta_update',
    entityType: 'business',
    entityId: biz.id,
    metadata: { delivery_eta_minutes: safeEta },
  })

  revalidatePath('/merchant/orders/settings')
  revalidatePath('/merchant/orders')
  return { ok: true }
}

// Merchant: day-to-day availability after administrator approval.
export async function setOrdersEnabled(enabled: boolean, etaMinutes?: number): Promise<Result> {
  if (typeof enabled !== 'boolean') return { ok: false, error: 'اختيار غير صحيح' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول' }

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()
  if (!biz) return { ok: false, error: 'مفيش نشاط مرتبط بحسابك' }

  const { data: current, error: readError } = await supabase
    .from('merchant_order_settings')
    .select('admin_enabled, orders_enabled, delivery_eta_minutes')
    .eq('business_id', biz.id)
    .maybeSingle()
  if (readError) return { ok: false, error: 'تعذر قراءة إعدادات استقبال الطلبات' }
  if (!current) return { ok: false, error: 'إعدادات الطلبات ناقصة؛ راجع الإدارة' }
  if (!current.admin_enabled) {
    return enabled
      ? { ok: false, error: 'الإدارة لازم تفعّل استقبال الطلبات للنشاط الأول' }
      : { ok: true }
  }

  let etaToSave: number | undefined
  if (enabled) {
    const candidate = etaMinutes ?? current.delivery_eta_minutes
    if (
      typeof candidate !== 'number' ||
      !Number.isFinite(candidate) ||
      !Number.isInteger(candidate) ||
      candidate < 15 ||
      candidate > 240
    ) {
      return { ok: false, error: 'حدد مدة التسليم من 15 لـ 240 دقيقة' }
    }
    etaToSave = candidate
  }

  const updates = enabled
    ? {
        orders_enabled: true,
        delivery_eta_minutes: etaToSave,
        offline_mode: false,
        offline_until: null,
        updated_at: new Date().toISOString(),
      }
    : { orders_enabled: false, updated_at: new Date().toISOString() }

  const { error: updateError } = await supabase
    .from('merchant_order_settings')
    .update(updates)
    .eq('business_id', biz.id)
  if (updateError) return { ok: false, error: 'فشل تحديث استقبال الطلبات' }

  await logAudit(supabase, {
    actorUserId: user.id,
    action: enabled ? 'orders.merchant_enable' : 'orders.merchant_disable',
    entityType: 'business',
    entityId: biz.id,
    metadata: { source: 'merchant_self' },
  })

  revalidatePath('/merchant/orders/settings')
  revalidatePath('/merchant/orders')
  revalidatePath(`/businesses/${biz.slug}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

