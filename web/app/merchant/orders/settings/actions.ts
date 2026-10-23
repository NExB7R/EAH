'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/logging/audit'

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
