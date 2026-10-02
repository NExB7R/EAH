import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — Merchant Data
// ═══════════════════════════════════════════════════════════

export type MerchantBusiness = {
  id: string
  slug: string
  name: string
  business_type: string
  area: string | null
  description: string | null
  hook: string | null
  address_text: string | null
  cover_image_url: string | null
  is_published: boolean
  is_open: boolean
  accepts_whatsapp_orders: boolean
  trust_score: number
  trust_tier: string
  successful_orders: number
  branches_count: number
  offers_count: number
  rating_avg: number
  rating_count: number
  created_at: string
}

export type MerchantContacts = {
  phone: string | null
  whatsapp: string | null
}

export type MerchantSubscription = {
  id: string
  status: string
  is_trial: boolean
  starts_at: string
  expires_at: string
  plan: {
    code: string
    name_ar: string
    price_egp: number
    features: string[]
  } | null
}

export type MerchantStats = {
  viewsToday: number
  viewsWeek: number
  viewsMonth: number
  ordersToday: number
  ordersWeek: number
  ordersTotal: number
  reviewsCount: number
}

// ─── Business (ملك التاجر) ───
export async function getMyBusiness(userId: string): Promise<MerchantBusiness | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select(
      'id, slug, name, business_type, area, description, hook, address_text, cover_image_url, is_published, is_open, accepts_whatsapp_orders, trust_score, trust_tier, successful_orders, branches_count, offers_count, rating_avg, rating_count, created_at',
    )
    .eq('owner_profile_id', userId)
    .maybeSingle()

  return (data as MerchantBusiness) ?? null
}

// ─── Contacts ───
export async function getMyContacts(businessId: string): Promise<MerchantContacts> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_contact_methods')
    .select('method_type, value')
    .eq('business_id', businessId)
    .in('method_type', ['phone', 'whatsapp'])

  const phone = data?.find((c) => c.method_type === 'phone')?.value ?? null
  const whatsapp = data?.find((c) => c.method_type === 'whatsapp')?.value ?? null
  return { phone, whatsapp }
}

// ─── Subscription ───
export async function getMySubscription(businessId: string): Promise<MerchantSubscription | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_subscriptions')
    .select(
      `
      id, status, is_trial, starts_at, expires_at,
      plan:subscription_plans(code, name_ar, price_egp, features)
    `,
    )
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (data as unknown as MerchantSubscription) ?? null
}

// ─── Stats ───
export async function getMerchantStats(businessId: string): Promise<MerchantStats> {
  const supabase = await createClient()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: viewsToday },
    { count: viewsWeek },
    { count: viewsMonth },
    { count: ordersToday },
    { count: ordersWeek },
    { count: ordersTotal },
    { count: reviewsCount },
  ] = await Promise.all([
    supabase
      .from('page_view_events')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', todayStart),
    supabase
      .from('page_view_events')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', weekStart),
    supabase
      .from('page_view_events')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', monthStart),
    supabase
      .from('order_requests')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', todayStart),
    supabase
      .from('order_requests')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', weekStart),
    supabase
      .from('order_requests')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId),
    supabase
      .from('business_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId),
  ])

  return {
    viewsToday: viewsToday ?? 0,
    viewsWeek: viewsWeek ?? 0,
    viewsMonth: viewsMonth ?? 0,
    ordersToday: ordersToday ?? 0,
    ordersWeek: ordersWeek ?? 0,
    ordersTotal: ordersTotal ?? 0,
    reviewsCount: reviewsCount ?? 0,
  }
}

// ─── Orders ───
export type MerchantOrder = {
  id: string
  order_code: string
  status: string
  message: string | null
  customer_name: string | null
  customer_phone: string | null
  created_at: string
}

export async function getMerchantOrders(businessId: string, limit = 50): Promise<MerchantOrder[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('order_requests')
    .select('id, order_code, status, message, customer_name, customer_phone, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []) as MerchantOrder[]
}

// ═══════════════════════════════════════════════════════════
// Merchant — Offers
// ═══════════════════════════════════════════════════════════

export type MerchantOffer = {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  starts_at: string | null
  ends_at: string | null
  is_published: boolean
  created_at: string
}

export async function getMerchantOffers(businessId: string): Promise<MerchantOffer[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('offers')
    .select(
      'id, title, description, price, image_url, starts_at, ends_at, is_published, created_at',
    )
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(100)

  return (data ?? []) as MerchantOffer[]
}
