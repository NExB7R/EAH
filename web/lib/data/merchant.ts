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
  location: { lat: number; lng: number } | null
  logo_url: string | null
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
  /** التجربة متاحة لو النشاط لسه مستخدمهاش + النشاط بتاع التاجر مش admin */
  trial_available?: boolean
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
  const { data, error } = await supabase
    .from('businesses')
    .select(
      'id, slug, name, business_type, area, description, hook, address_text, cover_image_url, is_published, is_open, accepts_whatsapp_orders, trust_score, trust_tier, successful_orders, branches_count, offers_count, rating_avg, rating_count, created_at, business_locations(latitude, longitude, is_primary)',
    )
    .eq('owner_profile_id', userId)
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  const { data: logo } = await supabase
    .from('business_media')
    .select('storage_path')
    .eq('business_id', data.id)
    .eq('media_type', 'logo')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle()

  const rawLocations = (data as typeof data & {
    business_locations?: { latitude: number | null; longitude: number | null; is_primary: boolean }[] | null
  }).business_locations ?? []
  const primaryLocation = rawLocations.find((item) => item.is_primary) ?? rawLocations[0]
  const location =
    primaryLocation &&
    typeof primaryLocation.latitude === 'number' &&
    typeof primaryLocation.longitude === 'number' &&
    Number.isFinite(primaryLocation.latitude) &&
    Number.isFinite(primaryLocation.longitude)
      ? { lat: primaryLocation.latitude, lng: primaryLocation.longitude }
      : null

  const { business_locations: _locations, ...business } = data as typeof data & {
    business_locations?: unknown
  }

  return {
    ...(business as Omit<MerchantBusiness, 'logo_url' | 'location'>),
    location,
    logo_url: logo?.storage_path ?? null,
  }
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

  const [{ data }, { data: biz }] = await Promise.all([
    supabase
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
      .maybeSingle(),
    supabase
      .from('businesses')
      .select('trial_used, source, owner_profile_id')
      .eq('id', businessId)
      .maybeSingle(),
  ])

  const sub = (data as unknown as MerchantSubscription | null) ?? null
  const bizRow = biz as {
    trial_used: boolean
    source: string
    owner_profile_id: string | null
  } | null

  const trial_available =
    !!bizRow && !bizRow.trial_used && bizRow.source === 'merchant' && !!bizRow.owner_profile_id

  if (sub) {
    return { ...sub, trial_available }
  }

  // مفيش اشتراك لسه — نرجّع object فاضي بس trial_available للزر
  return {
    id: '',
    status: 'none',
    is_trial: false,
    starts_at: '',
    expires_at: '',
    plan: null,
    trial_available,
  }
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
      .gte('occurred_at', todayStart),
    supabase
      .from('page_view_events')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('occurred_at', weekStart),
    supabase
      .from('page_view_events')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('occurred_at', monthStart),
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
  items: string | null
  notes: string | null
  customer_name: string | null
  customer_phone: string | null
  created_at: string
}

export async function getMerchantOrders(businessId: string, limit = 50): Promise<MerchantOrder[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('order_requests')
    .select('id, order_code, status, items, notes, customer_name, customer_phone, created_at')
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

// ═══════════════════════════════════════════════════════════
// Branches (فروع النشاط)
// ═══════════════════════════════════════════════════════════

export type MerchantBranch = {
  id: string
  business_id: string
  name: string
  area: string
  address_text: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  whatsapp: string | null
  is_primary: boolean
  is_active: boolean
  sort_order: number
}

export async function getMyBranches(businessId: string): Promise<MerchantBranch[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_branches')
    .select(
      'id, business_id, name, area, address_text, latitude, longitude, phone, whatsapp, is_primary, is_active, sort_order',
    )
    .eq('business_id', businessId)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })

  return (data ?? []) as MerchantBranch[]
}
