import { createNotification } from '@/lib/notifications/server'
import { createServiceClient } from '@/lib/supabase/service'

// ═══════════════════════════════════════════════════════════════════
// Lazy housekeeping — no cron needed.
// Called on order pages (merchant + customer). Idempotent.
//   - autoDeliverDueOrders: accepted orders past expected_delivery_at
//   - expireStaleOrders: sent/seen orders past deadline_at
// ═══════════════════════════════════════════════════════════════════

const FEEDBACK_DELAY_MS = 60 * 60 * 1000 // 1 hour after delivered (feedback due)
const FEEDBACK_REMINDER_DELAY_MS = 30 * 60 * 1000 // +30 min for reminder

export async function autoDeliverDueOrders(): Promise<number> {
  const supabase = createServiceClient()
  const now = new Date()
  const nowIso = now.toISOString()

  const { data: due } = await supabase
    .from('order_requests')
    .select('id')
    .in('status', ['accepted', 'preparing', 'on_way'])
    .lt('expected_delivery_at', nowIso)
    .limit(50)

  if (!due || due.length === 0) return 0

  const ids = due.map((o) => o.id)
  const feedbackDueAt = new Date(now.getTime() + FEEDBACK_DELAY_MS).toISOString()
  const feedbackReminderAt = new Date(
    now.getTime() + FEEDBACK_DELAY_MS + FEEDBACK_REMINDER_DELAY_MS,
  ).toISOString()

  const { error } = await supabase
    .from('order_requests')
    .update({
      status: 'delivered',
      delivered_at: nowIso,
      feedback_due_at: feedbackDueAt,
      feedback_reminder_at: feedbackReminderAt,
      updated_at: nowIso,
    })
    .in('id', ids)
    .in('status', ['accepted', 'preparing', 'on_way']) // ← race-safe guard

  if (error) return 0

  // Audit reactions (dedupe — race-safe)
  const { data: existing } = await supabase
    .from('order_reactions')
    .select('order_id')
    .in('order_id', ids)
    .eq('action', 'auto_delivered')

  const existingSet = new Set((existing ?? []).map((r) => r.order_id))
  const newReactions = ids
    .filter((id) => !existingSet.has(id))
    .map((id) => ({
      order_id: id,
      actor_type: 'system' as const,
      actor_id: null,
      action: 'auto_delivered',
      metadata: { reason: 'past_expected_delivery_at' },
    }))

  if (newReactions.length > 0) {
    await supabase.from('order_reactions').insert(newReactions)
  }

  return ids.length
}

// ═══════════════════════════════════════════════════════════════════
// Feedback reminder — send ONE reminder, +30 min after feedback due
// (so we're not annoying). Only for delivered orders without feedback.
// ═══════════════════════════════════════════════════════════════════
export async function sendFeedbackReminders(): Promise<number> {
  const supabase = createServiceClient()
  const nowIso = new Date().toISOString()

  const { data: due } = await supabase
    .from('order_requests')
    .select('id, order_code, customer_profile_id, business_id')
    .eq('status', 'delivered')
    .is('feedback_rating', null)
    .is('feedback_reminder_sent_at', null)
    .not('feedback_reminder_at', 'is', null)
    .lte('feedback_reminder_at', nowIso)
    .limit(50)

  if (!due || due.length === 0) return 0

  for (const o of due) {
    if (o.customer_profile_id) {
      await createNotification({
        userId: o.customer_profile_id,
        type: 'system',
        title: `رأيك يهمنا — طلب #${o.order_code}`,
        body: 'كيف كانت تجربتك؟ رأيك يساعدنا نحسّن الخدمة',
        deepLink: '/account/orders',
      })
    }
  }

  const ids = due.map((o) => o.id)
  await supabase.from('order_requests').update({ feedback_reminder_sent_at: nowIso }).in('id', ids)

  return ids.length
}
