import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════════════
// Admin Orders — centralized view across businesses
// ═══════════════════════════════════════════════════════════════════

export type AdminOrder = {
  id: string
  order_code: string
  status: string
  items: string | null
  notes: string | null
  customer_name: string | null
  customer_phone: string | null
  created_at: string
  accepted_at: string | null
  delivered_at: string | null
  expected_delivery_at: string | null
  payment_method: string | null
  feedback_rating: number | null
  business_id: string
  business_name: string
  business_slug: string
}

export type AdminOrdersStats = {
  total: number
  pending: number
  in_progress: number
  delivered: number
  cancelled: number
  today: number
}

export async function getAdminOrders(limit = 300): Promise<AdminOrder[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('order_requests')
    .select(
      `
      id, order_code, status, items, notes, customer_name, customer_phone,
      created_at, accepted_at, delivered_at, expected_delivery_at,
      payment_method, feedback_rating, business_id,
      business:businesses(name, slug)
    `,
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!data) return []

  return data.map((r) => {
    const biz = r.business as unknown as { name: string; slug: string } | null
    return {
      id: r.id,
      order_code: r.order_code,
      status: r.status,
      items: r.items,
      notes: r.notes,
      customer_name: r.customer_name,
      customer_phone: r.customer_phone,
      created_at: r.created_at,
      accepted_at: r.accepted_at,
      delivered_at: r.delivered_at,
      expected_delivery_at: r.expected_delivery_at,
      payment_method: r.payment_method,
      feedback_rating: r.feedback_rating,
      business_id: r.business_id,
      business_name: biz?.name ?? '—',
      business_slug: biz?.slug ?? '',
    }
  })
}

export function computeAdminOrdersStats(orders: AdminOrder[]): AdminOrdersStats {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayMs = todayStart.getTime()

  let pending = 0
  let in_progress = 0
  let delivered = 0
  let cancelled = 0
  let today = 0

  for (const o of orders) {
    if (new Date(o.created_at).getTime() >= todayMs) today++
    if (o.status === 'sent' || o.status === 'seen') pending++
    else if (['accepted', 'preparing', 'on_way'].includes(o.status)) in_progress++
    else if (o.status === 'delivered') delivered++
    else if (['rejected', 'cancelled', 'expired'].includes(o.status)) cancelled++
  }

  return {
    total: orders.length,
    pending,
    in_progress,
    delivered,
    cancelled,
    today,
  }
}

export type AdminOrderFlow = {
  today: number
  pending: number
  in_progress: number
  delivered_today: number
}

export async function getAdminOrderFlowStats(): Promise<AdminOrderFlow> {
  const supabase = await createClient()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayIso = todayStart.toISOString()

  const [today, pending, in_progress, deliveredToday] = await Promise.all([
    supabase
      .from('order_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayIso),
    supabase
      .from('order_requests')
      .select('id', { count: 'exact', head: true })
      .in('status', ['sent', 'seen']),
    supabase
      .from('order_requests')
      .select('id', { count: 'exact', head: true })
      .in('status', ['accepted', 'preparing', 'on_way']),
    supabase
      .from('order_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'delivered')
      .gte('delivered_at', todayIso),
  ])

  return {
    today: today.count ?? 0,
    pending: pending.count ?? 0,
    in_progress: in_progress.count ?? 0,
    delivered_today: deliveredToday.count ?? 0,
  }
}
