import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { createServiceClient } from '@/lib/supabase/service'
import { sortByTrend, trendScore } from '@/lib/ranking'
import { getBusinessReputationScore } from '@/lib/reputation'
import { getPaidBusinessIdsWithFeature, getPaidFeaturedHomeBusinessIds } from './featured-eligibility'
import { isBusinessOpen, isOpenNow } from '@/lib/utils/working-hours'
import { canAcceptInAppOrders } from './order-availability'
import { getWhatsAppDestinationBusinessIds } from './contact-availability'
import { getInAppOrderAvailableBusinessIds } from './in-app-order-availability'
import { isWhatsAppChannelAvailable } from './contact-availability-utils'

// ═══════════════════════════════════════════════════════════
// EAH — Data Fetching Layer
// ═══════════════════════════════════════════════════════════

export type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office' | 'misc'
export type BusinessTypeStatus = 'pending' | 'approved' | 'rejected' | null

export type WorkingDay = {
  open: string
  close: string
}

export type WorkingHours = Record<string, WorkingDay>

export type Business = {
  id: string
  slug: string
  name: string
  owner_profile_id?: string | null
  business_type: BusinessType
  custom_business_type?: string | null
  business_type_status?: BusinessTypeStatus
  subcategory: string | null
  description: string | null
  hook: string | null
  area: string | null
  city: string | null
  address_text: string | null
  map_url: string | null
  cover_image_url: string | null
  logo_url: string | null
  is_open: boolean
  is_featured: boolean
  is_verified: boolean
  verified_at: string | null
  is_new_project: boolean
  is_opportunity: boolean
  opportunity_until: string | null
  opportunity_note: string | null
  trust_score?: number
  trust_tier?: string
  velocity_score: number
  engagement_score: number
  diversity_score: number
  successful_orders: number
  featured_order: number
  featured_until: string | null
  featured_pin: boolean
  new_until: string | null
  working_hours: WorkingHours | null
  open_now_override?: boolean | null
  accepts_whatsapp_orders: boolean
  accepts_orders: boolean
  /** Legacy alias; public availability comes from accepts_orders. */
  orders_enabled: boolean
  response_time_avg_seconds: number | null
  response_rate: number | null
  last_activity_at: string | null
  /** Server-computed rolling trend signals; never persisted as reputation or paid boosts. */
  trend_activity_count?: number
  trend_activity_weight?: number
  trend_recent_orders?: number
  trend_recent_reviews?: number
  trend_score?: number
  branches_count: number
  offers_count: number
  rating_avg: number
  rating_count: number
  location: { lat: number; lng: number } | null
  created_at: string
  updated_at: string
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

export { getBusinessTypeLabel } from '../business-type-label'

export { isBusinessOpen, isOpenNow }

// ═══════════════════════════════════════════════════════════
// Select columns (نفس الترتيب في كل query)
// ═══════════════════════════════════════════════════════════

const BUSINESS_COLUMNS = `
  id, slug, name, owner_profile_id, business_type, custom_business_type, business_type_status, subcategory, description, hook,
  area, city, address_text, map_url, cover_image_url, logo_url,
  is_open, is_featured, is_verified, verified_at, is_new_project, is_opportunity, opportunity_until, opportunity_note,
  velocity_score, engagement_score, diversity_score, successful_orders,
  featured_order, featured_until, featured_pin,
  new_until, working_hours, open_now_override, accepts_whatsapp_orders, accepts_orders,
  response_time_avg_seconds, response_rate,
  last_activity_at, created_at, updated_at,
  branches_count, offers_count, rating_avg, rating_count,
  business_locations(latitude, longitude, is_primary)
`

// ─── Normalize: extract primary location from join ───
type RawLocation = { latitude: number; longitude: number; is_primary: boolean }

function pickPrimaryLocation(raw: unknown): { lat: number; lng: number } | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const arr = raw as RawLocation[]
  const primary = arr.find((l) => l.is_primary) ?? arr[0]
  if (!primary) return null
  if (
    typeof primary.latitude !== 'number' ||
    typeof primary.longitude !== 'number' ||
    !Number.isFinite(primary.latitude) ||
    !Number.isFinite(primary.longitude)
  ) {
    return null
  }
  return { lat: primary.latitude, lng: primary.longitude }
}

function normalizeBusiness(raw: Record<string, unknown>): Business {
  const loc = pickPrimaryLocation(raw.business_locations)
  const rest: Record<string, unknown> = { ...raw }
  delete rest.business_locations
  // Owner IDs are only used on the server to derive order availability; never serialize them.
  delete rest.owner_profile_id
  const acceptsOrders = canAcceptInAppOrders(raw.accepts_orders, raw.owner_profile_id)
  const isOpen = isBusinessOpen({
    working_hours: (raw.working_hours as WorkingHours | null) ?? null,
    open_now_override:
      typeof raw.open_now_override === 'boolean' ? raw.open_now_override : null,
    is_open: typeof raw.is_open === 'boolean' ? raw.is_open : null,
  })
  return {
    ...(rest as unknown as Business),
    location: loc,
    is_open: isOpen,
    accepts_orders: acceptsOrders,
    orders_enabled: acceptsOrders,
  }
}

async function normalizeBusinesses(
  data: unknown[] | null,
  supabase: ReturnType<typeof createServiceClient>,
): Promise<Business[]> {
  if (!data || data.length === 0) return []

  const rows = data.map((row) => row as Record<string, unknown>)
  const ids = rows.map((row) => String(row.id ?? ''))
  const [configuredWhatsAppIds, configuredInAppOrderIds, paidFeaturedBadgeIds] = await Promise.all([
    getWhatsAppDestinationBusinessIds(supabase, ids),
    getInAppOrderAvailableBusinessIds(
      supabase,
      rows.map((row) => ({
        id: String(row.id ?? ''),
        accepts_orders: row.accepts_orders,
        owner_profile_id: row.owner_profile_id,
      })),
    ),
    getPaidBusinessIdsWithFeature('featured_badge', ids),
  ])

  return rows.map((row) =>
    normalizeBusiness({
      ...row,
      accepts_orders: configuredInAppOrderIds.has(String(row.id ?? '')),
      accepts_whatsapp_orders: isWhatsAppChannelAvailable(
        row.accepts_whatsapp_orders,
        row.id,
        configuredWhatsAppIds,
      ),
      // The public badge requires an active paid plan that includes it.
      is_featured: !!row.is_featured && paidFeaturedBadgeIds.has(String(row.id ?? '')),
    }),
  )
}

// ═══════════════════════════════════════════════════════════
// 1. كل الأنشطة المنشورة (للـ Home)
// ═══════════════════════════════════════════════════════════

export const getPublishedBusinesses = unstable_cache(
  async (limit = 100): Promise<Business[]> => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      .order('rating_count', { ascending: false })
      .order('rating_avg', { ascending: false })
      .order('successful_orders', { ascending: false })
      .order('is_verified', { ascending: false })
      .limit(Math.max(1, Math.min(1000, Math.floor(limit))))

    if (error) {
      console.error('[data] getPublishedBusinesses error:', error.message)
      return []
    }
    const normalized = await normalizeBusinesses(data, supabase)
    return normalized.sort(
      (a, b) => getBusinessReputationScore(b) - getBusinessReputationScore(a),
    )
  },
  ['businesses-published-v4'],
  { revalidate: 300, tags: ['businesses'] },
)

/** Count published production activities for public marketing copy; exclude QA fixtures. */
export const getPublishedBusinessCount = unstable_cache(
  async (): Promise<number | null> => {
    const supabase = createServiceClient()
    const { count, error } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true)
      .not('slug', 'like', 'eah-qa-test-%')

    if (error) {
      console.error('[data] getPublishedBusinessCount error:', error.message)
      return null
    }
    return count ?? 0
  },
  ['businesses-published-count-v1'],
  { revalidate: 300, tags: ['businesses'] },
)

// ═══════════════════════════════════════════════════════════
// 2. الأنشطة المميزة (Featured)
// ═══════════════════════════════════════════════════════════

export const getFeaturedBusinesses = unstable_cache(
  async (limit = 1000): Promise<Business[]> => {
    const supabase = createServiceClient()
    const eligiblePaidIds = await getPaidFeaturedHomeBusinessIds()
    if (eligiblePaidIds.size === 0) return []

    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      .eq('is_featured', true)
      .in('id', [...eligiblePaidIds])
      .or(`featured_until.is.null,featured_until.gt.${new Date().toISOString()}`)
      // Featured eligibility is controlled by the administrator and payment status.
      // Ranking fields and manual pins must never create a permanent first place;
      // the visitor-side cycle shuffles the entire eligible set without repetition.
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('[data] getFeaturedBusinesses error:', error.message)
      return []
    }
    return await normalizeBusinesses(data, supabase)
  },
  ['businesses-featured-v4'],
  { revalidate: 300, tags: ['businesses', 'featured'] },
)

// ═══════════════════════════════════════════════════════════
// 3. بدايات (New projects — مشاريع لسه فاتحة)
// ═══════════════════════════════════════════════════════════

export const getNewBusinesses = unstable_cache(
  async (limit = 1000): Promise<Business[]> => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      .eq('is_new_project', true)
      .gt('new_until', new Date().toISOString())
      .order('new_until', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[data] getNewBusinesses error:', error.message)
      return []
    }
    return await normalizeBusinesses(data, supabase)
  },
  ['businesses-new-v3'],
  { revalidate: 300, tags: ['businesses', 'new'] },
)

// ═══════════════════════════════════════════════════════════
// 4. حسب النوع (للتصنيفات)
// ═══════════════════════════════════════════════════════════

export const getBusinessesByType = unstable_cache(
  async (type: BusinessType, limit = 20): Promise<Business[]> => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      .eq('business_type', type)
      .order('rating_count', { ascending: false })
      .order('rating_avg', { ascending: false })
      .order('successful_orders', { ascending: false })
      .order('is_verified', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[data] getBusinessesByType error:', error.message)
      return []
    }
    return await normalizeBusinesses(data, supabase)
  },
  ['businesses-by-type-v3'],
  { revalidate: 300, tags: ['businesses'] },
)

// ═══════════════════════════════════════════════════════════
// 4.5. Top Businesses (للـ fallback في Featured)
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// 5. الفرص (Opportunities)
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// 6. نشاط واحد (slug)
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// 7. الأنشطة الترند (Trending)
// ═══════════════════════════════════════════════════════════

export const getTrendingBusinesses = unstable_cache(
  async (limit = 10): Promise<Business[]> => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      // Do not pre-filter by featured status, verification, rating or sales.
      // Every published activity gets a chance to enter the candidate set.
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) {
      console.error('[data] getTrendingBusinesses candidates failed:', error.message)
      return []
    }

    const candidates = await normalizeBusinesses(data, supabase)
    if (candidates.length === 0) return []

    const ids = candidates.map((business) => business.id)
    const now = Date.now()
    const since30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [
      { data: activities, error: activitiesError },
      { data: contactEvents, error: contactEventsError },
      { data: pageViews, error: pageViewsError },
      { data: deliveredOrders, error: ordersError },
      { data: approvedReviews, error: reviewsError },
    ] = await Promise.all([
      supabase
        .from('business_activities')
        .select('business_id, user_id, activity_type, created_at')
        .in('business_id', ids)
        .gte('created_at', since30)
        .order('created_at', { ascending: false })
        .limit(20000),
      supabase
        .from('engagement_events')
        .select('business_id, user_id, action, ip_hash, created_at')
        .in('business_id', ids)
        .gte('created_at', since30)
        .order('created_at', { ascending: false })
        .limit(20000),
      supabase
        .from('page_view_events')
        .select('business_id, visitor_id, occurred_at')
        .in('business_id', ids)
        .eq('event_scope', 'business')
        .gte('occurred_at', since30)
        .order('occurred_at', { ascending: false })
        .limit(20000),
      supabase
        .from('order_requests')
        .select('business_id, customer_profile_id, delivered_at, created_at')
        .in('business_id', ids)
        .eq('status', 'delivered')
        .gte('delivered_at', since30)
        .order('delivered_at', { ascending: false })
        .limit(20000),
      supabase
        .from('business_reviews')
        .select('business_id, user_id, created_at')
        .in('business_id', ids)
        .eq('status', 'approved')
        .gte('created_at', since30)
        .order('created_at', { ascending: false })
        .limit(20000),
    ])

    if (activitiesError || contactEventsError || pageViewsError || ordersError || reviewsError) {
      console.error('[data] trend signals partially unavailable:', {
        activities: activitiesError?.message,
        contacts: contactEventsError?.message,
        pageViews: pageViewsError?.message,
        orders: ordersError?.message,
        reviews: reviewsError?.message,
      })
    }

    type Signal = {
      recentWeight: number
      weeklyWeight: number
      users: Set<string>
      lastActivityAt: string | null
      recentOrders: number
      recentReviews: number
      activityCount: number
    }
    const signalByBusiness = new Map<string, Signal>()
    for (const id of ids) {
      signalByBusiness.set(id, {
        recentWeight: 0,
        weeklyWeight: 0,
        users: new Set<string>(),
        lastActivityAt: null,
        recentOrders: 0,
        recentReviews: 0,
        activityCount: 0,
      })
    }

    const seen = new Set<string>()
    const addSignal = (
      businessId: string,
      userId: string | null,
      action: string,
      createdAt: string,
      weight: number,
      anonymousKey?: string | null,
    ): boolean => {
      const signal = signalByBusiness.get(businessId)
      const timestamp = new Date(createdAt).getTime()
      if (
        !signal ||
        weight <= 0 ||
        !Number.isFinite(timestamp) ||
        timestamp > now ||
        timestamp < now - 30 * 86400000
      ) return false

      const day = new Date(timestamp).toISOString().slice(0, 10)
      const actorKey = userId ?? anonymousKey ?? null
      if (!actorKey) return false
      const key = `${businessId}:${actorKey}:${action}:${day}`
      if (seen.has(key)) return false
      seen.add(key)
      signal.users.add(actorKey)

      signal.recentWeight += weight
      signal.activityCount += 1
      if (timestamp >= now - 7 * 86400000) signal.weeklyWeight += weight
      if (!signal.lastActivityAt || timestamp > new Date(signal.lastActivityAt).getTime()) {
        signal.lastActivityAt = new Date(timestamp).toISOString()
      }
      return true
    }

    const activityWeights: Record<string, number> = {
      follow: 2.5,
      favorite: 2.5,
      share: 3.5,
      rating: 3,
      comment: 2,
      reply: 1.5,
      like: 0.5,
    }
    for (const event of activities ?? []) {
      addSignal(
        event.business_id,
        event.user_id,
        event.activity_type === 'rating' ? 'review' : event.activity_type,
        event.created_at,
        activityWeights[event.activity_type] ?? 0,
      )
    }

    const contactWeights: Record<string, number> = {
      phone_reveal: 0.8,
      whatsapp: 1.2,
      review: 3,
      comment: 2,
    }
    for (const event of contactEvents ?? []) {
      addSignal(
        event.business_id,
        event.user_id,
        event.action,
        event.created_at,
        contactWeights[event.action] ?? 0,
        event.ip_hash,
      )
    }

    // Session-level page views are low-weight momentum signals. The same
    // visitor contributes at most once per business/action/day after server dedupe.
    for (const event of pageViews ?? []) {
      if (!event.business_id) continue
      addSignal(
        event.business_id,
        null,
        'page_view',
        event.occurred_at,
        0.35,
        event.visitor_id,
      )
    }

    for (const order of deliveredOrders ?? []) {
      const counted = addSignal(
        order.business_id,
        order.customer_profile_id,
        'delivered_order',
        order.delivered_at ?? order.created_at,
        4,
      )
      const signal = signalByBusiness.get(order.business_id)
      if (counted && signal) signal.recentOrders += 1
    }

    for (const review of approvedReviews ?? []) {
      const counted = addSignal(review.business_id, review.user_id, 'review', review.created_at, 3)
      const signal = signalByBusiness.get(review.business_id)
      if (counted && signal) signal.recentReviews += 1
    }

    const rankedCandidates = candidates.map((business) => {
      const signal = signalByBusiness.get(business.id)
      if (!signal) return business
      return {
        ...business,
        velocity_score: 50 * (1 - Math.exp(-signal.weeklyWeight / 8)),
        engagement_score: 100 * (1 - Math.exp(-signal.recentWeight / 28)),
        diversity_score: 50 * (1 - Math.exp(-signal.users.size / 8)),
        last_activity_at: signal.lastActivityAt,
        trend_activity_count: signal.activityCount,
        trend_activity_weight: signal.recentWeight,
        trend_recent_orders: signal.recentOrders,
        trend_recent_reviews: signal.recentReviews,
      }
    })

    // An activity without verified recent customer signals is not a "trend".
    // It remains discoverable in its other sections, but cannot be promoted here.
    return sortByTrend(rankedCandidates.filter((business) =>
      (business.trend_activity_weight ?? 0) >= 1 ||
      (business.trend_recent_orders ?? 0) > 0 ||
      (business.trend_recent_reviews ?? 0) > 0,
    ))
      .map((business) => ({ ...business, trend_score: trendScore(business) }))
      .slice(0, Math.max(0, Math.min(1000, Math.floor(limit))))
  },
  ['businesses-trending-v4'],
  { revalidate: 180, tags: ['businesses', 'trending'] },
)

// ═══════════════════════════════════════════════════════════
// 8. العروض النشطة (Offers — للـ Home)
// ═══════════════════════════════════════════════════════════

export type Offer = {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  starts_at: string | null
  ends_at: string | null
  created_at: string
  business: {
    id: string
    slug: string
    name: string
    area: string | null
    is_verified: boolean
    rating_avg: number
    rating_count?: number
    successful_orders?: number
    location?: { lat: number; lng: number } | null
    velocity_score?: number
    engagement_score?: number
    diversity_score?: number
    last_activity_at?: string | null
  } | null
}

export const getActiveOffers = unstable_cache(
  async (limit = 8): Promise<Offer[]> => {
    const supabase = createPublicClient()
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('offers')
      .select(
        `
        id, title, description, price, image_url, starts_at, ends_at, created_at,
        business:businesses(id, slug, name, area, is_verified, rating_avg, rating_count, successful_orders, velocity_score, engagement_score, diversity_score, last_activity_at, business_locations(latitude, longitude, is_primary))
      `,
      )
      .eq('is_published', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[data] getActiveOffers error:', error.message)
      return []
    }
    return (data ?? []).map((row) => {
      const raw = row as unknown as {
        business?: (Omit<NonNullable<Offer['business']>, 'location'> & {
          business_locations?: { latitude: number; longitude: number; is_primary: boolean }[] | null
        }) | null
      } & Record<string, unknown>
      const locations = raw.business?.business_locations ?? []
      const primary = locations.find((item) => item.is_primary) ?? locations[0]
      const location =
        primary &&
        Number.isFinite(primary.latitude) &&
        Number.isFinite(primary.longitude) &&
        primary.latitude >= -90 &&
        primary.latitude <= 90 &&
        primary.longitude >= -180 &&
        primary.longitude <= 180
          ? { lat: primary.latitude, lng: primary.longitude }
          : null
      const business = raw.business
        ? { ...raw.business, location }
        : null
      return { ...raw, business } as unknown as Offer
    })
  },
  ['offers-active'],
  { revalidate: 300, tags: ['offers'] },
)

// ═══════════════════════════════════════════════════════════
// 9. القريب منك (Nearby)
// ═══════════════════════════════════════════════════════════

export const getNearbyBusinesses = unstable_cache(
  async (area?: string, limit = 4): Promise<Business[]> => {
    const supabase = createServiceClient()
    let q = supabase.from('businesses').select(BUSINESS_COLUMNS).eq('is_published', true)

    if (area) q = q.eq('area', area)

    const { data, error } = await q.order('rating_count', { ascending: false })
      .order('rating_avg', { ascending: false })
      .order('successful_orders', { ascending: false })
      .order('is_verified', { ascending: false }).limit(limit)

    if (error) {
      console.error('[data] getNearbyBusinesses error:', error.message)
      return []
    }
    return await normalizeBusinesses(data, supabase)
  },
  ['businesses-nearby-v3'],
  { revalidate: 300, tags: ['businesses'] },
)
