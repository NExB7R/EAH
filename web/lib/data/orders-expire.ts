import { createServiceClient } from '@/lib/supabase/service'
import { createNotification } from '@/lib/notifications/server'

// ═══════════════════════════════════════════════════════════════════
// Lazy expire — no cron needed.
// Called on merchant/admin page loads. Idempotent, safe to run often.
// - Finds `sent`/`seen` orders whose `deadline_at` < now
// - Marks `expired` + audit reaction
// - Recomputes missed_count_today + missed_count_week FROM TRUTH (no drift)
// - Notifies merchant per batch
// - Triggers 24h suspension at 10 missed/week (once)
// ═══════════════════════════════════════════════════════════════════

export async function expireStaleOrders(businessId?: string): Promise<number> {
  const supabase = createServiceClient()
  const now = new Date()
  const nowIso = now.toISOString()

  // 1) Find stale orders (all businesses or one)
  let query = supabase
    .from('order_requests')
    .select('id, order_code, created_at, business_id')
    .in('status', ['sent', 'seen'])
    .lt('deadline_at', nowIso)
    .limit(100)

  if (businessId) {
    query = query.eq('business_id', businessId)
  }

  const { data: stale, error } = await query
  if (error || !stale || stale.length === 0) return 0

  const ids = stale.map((o) => o.id)

  // 2) Update to expired (guard: only if still in same state — race-safe)
  const { error: updErr } = await supabase
    .from('order_requests')
    .update({
      status: 'expired',
      expired_at: nowIso,
      updated_at: nowIso,
    })
    .in('id', ids)
    .in('status', ['sent', 'seen'])

  if (updErr) return 0

  // 3) Audit reactions (with dedupe — race-safe)
  const { data: existingReactions } = await supabase
    .from('order_reactions')
    .select('order_id')
    .in('order_id', ids)
    .eq('action', 'expired')

  const existingSet = new Set((existingReactions ?? []).map((r) => r.order_id))
  const newReactions = stale
    .filter((o) => !existingSet.has(o.id))
    .map((o) => ({
      order_id: o.id,
      actor_type: 'system' as const,
      actor_id: null,
      action: 'expired',
      metadata: { order_code: o.order_code, created_at: o.created_at },
    }))

  if (newReactions.length > 0) {
    await supabase.from('order_reactions').insert(newReactions)
  }

  // 4) Group by business for counters + notifications
  const byBiz = new Map<string, string[]>()
  for (const o of stale) {
    const arr = byBiz.get(o.business_id) ?? []
    arr.push(o.order_code)
    byBiz.set(o.business_id, arr)
  }

  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  for (const [bizId, codes] of byBiz) {
    // 4a. Recompute FROM TRUTH (no drift — no incremental counters)
    const [todayRes, weekRes] = await Promise.all([
      supabase
        .from('order_requests')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', bizId)
        .eq('status', 'expired')
        .gte('expired_at', todayStart.toISOString()),
      supabase
        .from('order_requests')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', bizId)
        .eq('status', 'expired')
        .gte('expired_at', weekAgo.toISOString()),
    ])

    const countToday = todayRes.count ?? 0
    const countWeek = weekRes.count ?? 0

    // 4b. Check current suspension state
    const { data: currentSettings } = await supabase
      .from('merchant_order_settings')
      .select('suspended_until')
      .eq('business_id', bizId)
      .maybeSingle()

    const alreadySuspended = currentSettings?.suspended_until
      ? new Date(currentSettings.suspended_until).getTime() > now.getTime()
      : false

    // 4c. Trigger suspension at 10 missed/week (once)
    const shouldSuspend = countWeek >= 10 && !alreadySuspended
    const suspensionUntil = shouldSuspend
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      : undefined

    await supabase
      .from('merchant_order_settings')
      .update({
        missed_count_today: countToday,
        missed_count_week: countWeek,
        last_missed_at: nowIso,
        last_miss_reset: todayStart.toISOString().slice(0, 10),
        ...(shouldSuspend && {
          suspended_until: suspensionUntil,
          suspension_reason: `10 طلبات فاتت دون رد خلال الأسبوع (${countWeek} طلب)`,
        }),
        updated_at: nowIso,
      })
      .eq('business_id', bizId)

    // 4d. Notify merchant
    const { data: biz } = await supabase
      .from('businesses')
      .select('owner_profile_id')
      .eq('id', bizId)
      .maybeSingle()

    if (biz?.owner_profile_id) {
      const codesSample = codes.slice(0, 3).join(' · ')
      const more = codes.length > 3 ? ` و${codes.length - 3} طلب آخر` : ''

      await createNotification({
        userId: biz.owner_profile_id,
        type: 'order_status',
        title: `⏱️ ${codes.length} طلب فات دون رد`,
        body: shouldSuspend
          ? `الطلبات (${codesSample}${more}) فاتت. تم إيقاف الاستلام 24 ساعة.`
          : `الطلبات (${codesSample}${more}) فاتت. متبقي ${10 - countWeek} طلب قبل إيقاف الاستلام 24 ساعة.`,
        deepLink: '/merchant/orders/settings',
        pushTag: `expire-batch-${bizId}`,
      })
    }
  }

  return stale.length
}
