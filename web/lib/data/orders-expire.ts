import { createServiceClient } from '@/lib/supabase/service'

// ═══════════════════════════════════════════════════════════════════
// Lazy expire — no cron needed.
// Called on merchant/admin page loads. Idempotent, safe to run often.
// - Finds `sent`/`seen` orders whose `deadline_at` < now
// - Marks them `expired` + records reaction + increments missed counters
// ═══════════════════════════════════════════════════════════════════

export async function expireStaleOrders(businessId: string): Promise<number> {
  const supabase = createServiceClient()
  const now = new Date().toISOString()

  const { data: stale, error } = await supabase
    .from('order_requests')
    .select('id, order_code, created_at')
    .eq('business_id', businessId)
    .in('status', ['sent', 'seen'])
    .lt('deadline_at', now)
    .limit(50)

  if (error || !stale || stale.length === 0) return 0

  const ids = stale.map((o) => o.id)

  const { error: updErr } = await supabase
    .from('order_requests')
    .update({
      status: 'expired',
      expired_at: now,
      updated_at: now,
    })
    .in('id', ids)

  if (updErr) return 0

  // Insert reactions (one per order)
  const reactions = stale.map((o) => ({
    order_id: o.id,
    actor_type: 'system' as const,
    actor_id: null,
    action: 'expired',
    metadata: { order_code: o.order_code, created_at: o.created_at },
  }))
  await supabase.from('order_reactions').insert(reactions)

  // Increment missed counters (in one update)
  const { data: settings } = await supabase
    .from('merchant_order_settings')
    .select('missed_count_today, missed_count_week, last_miss_reset')
    .eq('business_id', businessId)
    .maybeSingle()

  if (settings) {
    const today = new Date().toISOString().slice(0, 10)
    const shouldReset = settings.last_miss_reset !== today
    const newToday = (shouldReset ? 0 : settings.missed_count_today) + stale.length
    const newWeek = settings.missed_count_week + stale.length

    await supabase
      .from('merchant_order_settings')
      .update({
        missed_count_today: newToday,
        missed_count_week: newWeek,
        last_missed_at: now,
        last_miss_reset: today,
        updated_at: now,
      })
      .eq('business_id', businessId)
  }

  return stale.length
}
