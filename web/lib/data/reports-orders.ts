import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

// ═══════════════════════════════════════════════════════════════════
// Reports: orders + ETA + feedback aggregation
// Used by admin report builder + admin insights detail view
// ═══════════════════════════════════════════════════════════════════

export type OrderMetrics = {
  total: number
  accepted: number
  rejected: number
  expired: number
  delivered: number
  cancelled: number
  accept_rate: number
  deliver_rate: number
  avg_response_min: number | null
  on_time_delivery_rate: number | null
  avg_feedback_rating: number | null
  feedback_count: number
  issue_breakdown: Record<string, number>
  payment_breakdown: Record<string, number>
}

export async function getOrderMetricsForBusiness(
  businessId: string,
  periodStart: string,
  periodEnd: string,
  supabase?: SupabaseClient,
): Promise<OrderMetrics> {
  const client = supabase ?? (await createClient())
  const { data } = await client
    .from('order_requests')
    .select(
      'status, created_at, accepted_at, expected_delivery_at, delivered_at, feedback_rating, feedback_issue_type, payment_method',
    )
    .eq('business_id', businessId)
    .gte('created_at', periodStart)
    .lte('created_at', periodEnd)

  const list = data ?? []
  const total = list.length

  let accepted = 0
  let rejected = 0
  let expired = 0
  let delivered = 0
  let cancelled = 0
  let onTime = 0
  let deliveredWithEta = 0
  let ratingsSum = 0
  let ratingsCount = 0
  const issueBreakdown: Record<string, number> = {}
  const paymentBreakdown: Record<string, number> = {}
  const responseTimes: number[] = []

  for (const r of list) {
    const status = r.status as string
    if (['accepted', 'preparing', 'on_way', 'delivered'].includes(status)) accepted++
    else if (status === 'rejected') rejected++
    else if (status === 'expired') expired++
    else if (status === 'cancelled') cancelled++

    if (r.accepted_at && r.created_at) {
      const diff = (new Date(r.accepted_at).getTime() - new Date(r.created_at).getTime()) / 1000
      if (diff >= 0 && diff < 3600) responseTimes.push(diff)
    }

    if (status === 'delivered') {
      delivered++
      if (r.delivered_at && r.expected_delivery_at) {
        deliveredWithEta++
        if (new Date(r.delivered_at).getTime() <= new Date(r.expected_delivery_at).getTime()) {
          onTime++
        }
      }
      if (typeof r.feedback_rating === 'number') {
        ratingsSum += r.feedback_rating
        ratingsCount++
        if (r.feedback_issue_type) {
          const key = r.feedback_issue_type as string
          issueBreakdown[key] = (issueBreakdown[key] ?? 0) + 1
        }
      }
    }

    if (r.payment_method) {
      const key = r.payment_method as string
      paymentBreakdown[key] = (paymentBreakdown[key] ?? 0) + 1
    }
  }

  const avgResponse =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 60)
      : null

  const onTimeRate = deliveredWithEta > 0 ? Math.round((onTime / deliveredWithEta) * 100) : null

  return {
    total,
    accepted,
    rejected,
    expired,
    delivered,
    cancelled,
    accept_rate: total > 0 ? Math.round((accepted / total) * 100) : 0,
    deliver_rate: total > 0 ? Math.round((delivered / total) * 100) : 0,
    avg_response_min: avgResponse,
    on_time_delivery_rate: onTimeRate,
    avg_feedback_rating:
      ratingsCount > 0 ? Math.round((ratingsSum / ratingsCount) * 10) / 10 : null,
    feedback_count: ratingsCount,
    issue_breakdown: issueBreakdown,
    payment_breakdown: paymentBreakdown,
  }
}
