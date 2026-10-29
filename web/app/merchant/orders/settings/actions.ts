'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/logging/audit'
import { createServiceClient } from '@/lib/supabase/service'

// ═══════════════════════════════════════════════════════════════════
// Merchant: toggle offline_mode (temporary unavailable — no penalty)
// ═══════════════════════════════════════════════════════════════════

type Result = { ok: true } | { ok: false; error: string }

export async function setOfflineMode(offline: boolean, untilIso?: string): Promise<Result> {
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

  const safeEta = Math.max(15, Math.min(240, Math.trunc(etaMinutes) || 0))
  if (safeEta < 15) return { ok: false, error: 'حدد مدة التسليم (15-240 دقيقة)' }

  const { data: biz } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'مفيش نشاط مرتبط بحسابك' }

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

// ═══════════════════════════════════════════════════════════════════
// Merchant: toggle order receiving (master switch)
//   - upsert (لو التاجر مش عنده صف، ننشئه)
//   - لو enabled=true بدون merchant_order_settings → defaults (10/30)
// ═══════════════════════════════════════════════════════════════════

export async function setOrdersEnabled(enabled: boolean, etaMinutes?: number): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول' }

  const { data: roleRow, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()
  if (roleError) return { ok: false, error: 'تعذر التحقق من دور الحساب' }
  if (roleRow?.role !== 'merchant') {
    return { ok: false, error: 'تفعيل الطلبات متاح للبايع المرتبط بالنشاط فقط' }
  }

  const { data: biz, error: businessError } = await supabase
    .from('businesses')
    .select('id, name, slug, owner_profile_id')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (businessError) return { ok: false, error: 'تعذر تحميل نشاطك — حاول تاني' }
  if (!biz) return { ok: false, error: 'مفيش نشاط مرتبط بحسابك' }

  // Ownership is checked with the authenticated session above and again below.
  // Only then use the server-only client to pass the DB trigger that prevents
  // direct client changes to orders_enabled.
  let adminDb: ReturnType<typeof createServiceClient>
  try {
    adminDb = createServiceClient()
  } catch {
    return { ok: false, error: 'إعدادات الطلبات غير متاحة مؤقتًا — حاول تاني' }
  }

  const { data: verifiedBusiness, error: verifyError } = await adminDb
    .from('businesses')
    .select('id, slug, owner_profile_id')
    .eq('id', biz.id)
    .eq('owner_profile_id', user.id)
    .maybeSingle()

  if (verifyError) return { ok: false, error: 'تعذر تأكيد ملكية النشاط — حاول تاني' }
  if (!verifiedBusiness) return { ok: false, error: 'النشاط مش مربوط بحسابك حاليًا' }

  const { data: current, error: currentError } = await adminDb
    .from('merchant_order_settings')
    .select('delivery_eta_minutes, deadline_minutes, orders_enabled')
    .eq('business_id', biz.id)
    .maybeSingle()

  if (currentError) return { ok: false, error: 'تعذر تحميل إعدادات الطلبات' }

  if (enabled) {
    const requestedEta =
      typeof etaMinutes === 'number' && Number.isFinite(etaMinutes)
        ? Math.trunc(etaMinutes)
        : current?.delivery_eta_minutes ?? 30
    const eta = Math.max(15, Math.min(240, requestedEta))

    const { error: settingsError } = await adminDb.from('merchant_order_settings').upsert(
      {
        business_id: biz.id,
        orders_enabled: true,
        orders_enabled_at: new Date().toISOString(),
        delivery_eta_minutes: eta,
        deadline_minutes: current?.deadline_minutes ?? 10,
        offline_mode: false,
        offline_until: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id' },
    )

    if (settingsError) {
      console.error('[setOrdersEnabled] enable settings failed:', settingsError.message)
      return { ok: false, error: 'فشل تفعيل الاستلام — حاول تاني' }
    }

    const { data: enabledBusiness, error: flagError } = await adminDb
      .from('businesses')
      .update({ accepts_orders: true })
      .eq('id', biz.id)
      .eq('owner_profile_id', user.id)
      .select('id')
      .maybeSingle()

    if (flagError || !enabledBusiness) {
      const { error: rollbackError } = await adminDb
        .from('merchant_order_settings')
        .update({ orders_enabled: false, updated_at: new Date().toISOString() })
        .eq('business_id', biz.id)

      await logAudit(adminDb, {
        actorUserId: user.id,
        action: 'orders.merchant_enable_partial_failure',
        entityType: 'business',
        entityId: biz.id,
        metadata: {
          business_flag_error: flagError?.message ?? 'no row updated',
          rollback_error: rollbackError?.message ?? null,
        },
      })
      return { ok: false, error: 'تعذر تفعيل الطلبات للنشاط. لم نفعّل الزر العام؛ حاول تاني.' }
    }
  } else {
    // Close the public CTA first. If settings persistence fails, order submission
    // still fails closed because businesses.accepts_orders is already false.
    const { data: disabledBusiness, error: flagError } = await adminDb
      .from('businesses')
      .update({ accepts_orders: false })
      .eq('id', biz.id)
      .eq('owner_profile_id', user.id)
      .select('id')
      .maybeSingle()

    if (flagError || !disabledBusiness) {
      return { ok: false, error: 'تعذر إيقاف الطلبات العامة — حاول تاني' }
    }

    const { error: settingsError } = await adminDb
      .from('merchant_order_settings')
      .upsert(
        {
          business_id: biz.id,
          orders_enabled: false,
          orders_disabled_at: new Date().toISOString(),
          deadline_minutes: current?.deadline_minutes ?? 10,
          delivery_eta_minutes: current?.delivery_eta_minutes ?? 30,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'business_id' },
      )

    if (settingsError) {
      await logAudit(adminDb, {
        actorUserId: user.id,
        action: 'orders.merchant_disable_partial_failure',
        entityType: 'business',
        entityId: biz.id,
        metadata: { settings_error: settingsError.message },
      })
      return { ok: false, error: 'زر الطلب اتوقف، لكن تعذر حفظ إعداد الاستلام. حاول تاني.' }
    }
  }

  await logAudit(adminDb, {
    actorUserId: user.id,
    action: enabled ? 'orders.merchant_enable' : 'orders.merchant_disable',
    entityType: 'business',
    entityId: biz.id,
    metadata: { source: 'merchant_self', enabled },
  })

  revalidatePath('/merchant/orders/settings')
  revalidatePath('/merchant/orders')
  revalidatePath(`/businesses/${verifiedBusiness.slug}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}
