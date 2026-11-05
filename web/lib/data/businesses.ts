import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { createServiceClient } from '@/lib/supabase/service'
import { sortByTrend } from '@/lib/ranking'
import { getBusinessReputationScore } from '@/lib/reputation'
import { isBusinessOpen, isOpenNow } from '@/lib/utils/working-hours'
import { canAcceptInAppOrders } from './order-availability'
import { getWhatsAppDestinationBusinessIds } from './contact-availability'
import { getInAppOrderAvailableBusinessIds } from './in-app-order-availability'
import { isWhatsAppChannelAvailable } from './contact-availability-utils'
import { isPromotionActive } from './promotion-status'
import {
  getPublishedBusinessLimit,
  onlyPublishedBusinessRows,
} from './published-business-pool'


// ═══════════════════════════════════════════════════════════
// EAH — Data Fetching Layer
// ═══════════════════════════════════════════════════════════

export type BusinessType = 'restaurant' | 'pharmacy' | 'delivery_office' | 'misc'
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
    is_featured: isPromotionActive(raw.is_featured === true, raw.featured_until),
    is_new_project: isPromotionActive(raw.is_new_project === true, raw.new_until),
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
  const [configuredWhatsAppIds, configuredInAppOrderIds] = await Promise.all([
    getWhatsAppDestinationBusinessIds(supabase, ids),
    getInAppOrderAvailableBusinessIds(
      supabase,
      rows.map((row) => ({
        id: String(row.id ?? ''),
        accepts_orders: row.accepts_orders,
        owner_profile_id: row.owner_profile_id,
      })),
    ),
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
    }),
  )
}

// ═══════════════════════════════════════════════════════════
// 1. كل الأنشطة المنشورة (للـ Home)
// ═══════════════════════════════════════════════════════════

const DEFAULT_PUBLISHED_BUSINESSES = 100

export const getPublishedBusinesses = unstable_cache(
  async (requestedLimit = DEFAULT_PUBLISHED_BUSINESSES): Promise<Business[]> => {
    const limit = getPublishedBusinessLimit(requestedLimit)
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      .order('rating_count', { ascending: false })
      .order('rating_avg', { ascending: false })
      .order('successful_orders', { ascending: false })
      .order('is_verified', { ascending: false })
      .order('id', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('[data] getPublishedBusinesses error:', error.message)
      return []
    }
    const publishedRows = onlyPublishedBusinessRows(data)
    const normalized = await normalizeBusinesses(publishedRows, supabase)
    return normalized.sort(
      (a, b) => getBusinessReputationScore(b) - getBusinessReputationScore(a),
    )
  },
  ['businesses-published-v4'],
  { revalidate: 60, tags: ['businesses'] },
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
  async (limit?: number): Promise<Business[]> => {
    const supabase = createServiceClient()
    const pageSize = 200
    const rows: unknown[] = []

    for (let offset = 0; ; offset += pageSize) {
      let query = supabase
        .from('businesses')
        .select(BUSINESS_COLUMNS)
        .eq('is_published', true)
        .eq('is_featured', true)
        .or(`featured_until.is.null,featured_until.gte.${new Date().toISOString()}`)
        .order('featured_pin', { ascending: false })
        .order('featured_order', { ascending: true })
        .order('rating_count', { ascending: false })
        .order('rating_avg', { ascending: false })
        .order('successful_orders', { ascending: false })
        .order('is_verified', { ascending: false })
        .order('id', { ascending: true })
        .range(offset, offset + pageSize - 1)

      if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
        query = query.limit(Math.min(pageSize, Math.max(1, Math.ceil(limit - rows.length))))
      }

      const { data, error } = await query
      if (error) {
        console.error('[data] getFeaturedBusinesses error:', error.message)
        return []
      }

      rows.push(...(data ?? []))
      if (!data || data.length < pageSize || (typeof limit === 'number' && rows.length >= limit)) {
        break
      }
    }

    const selected = typeof limit === 'number' && Number.isFinite(limit) && limit > 0
      ? rows.slice(0, Math.floor(limit))
      : rows
    return await normalizeBusinesses(selected, supabase)
  },
  ['businesses-featured-v4'],
  { revalidate: 60, tags: ['businesses', 'featured'] },
)
// ═══════════════════════════════════════════════════════════
// 3. بدايات (New projects — مشاريع لسه فاتحة)
// ═══════════════════════════════════════════════════════════

export const getNewBusinesses = unstable_cache(
  async (limit = 10): Promise<Business[]> => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      .eq('is_new_project', true)
      .or(`new_until.is.null,new_until.gte.${new Date().toISOString()}`)
      .order('new_until', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[data] getNewBusinesses error:', error.message)
      return []
    }
    return await normalizeBusinesses(data, supabase)
  },
  ['businesses-new-v3'],
  { revalidate: 60, tags: ['businesses', 'new'] },
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
  { revalidate: 60, tags: ['businesses'] },
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
    const pageSize = 200
    const concurrency = 4
    const { count, error: countError } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true)

    if (countError || count === null) {
      console.error('[data] getTrendingBusinesses count error:', countError?.message)
      return []
    }
    if (count === 0) return []

    const offsets = Array.from(
      { length: Math.ceil(count / pageSize) },
      (_, index) => index * pageSize,
    )
    const rows: unknown[] = []

    for (let index = 0; index < offsets.length; index += concurrency) {
      const pageResults = await Promise.all(
        offsets.slice(index, index + concurrency).map((offset) =>
          supabase
            .from('businesses')
            .select(BUSINESS_COLUMNS)
            .eq('is_published', true)
            .order('id', { ascending: true })
            .range(offset, offset + pageSize - 1),
        ),
      )
      const failedPage = pageResults.find((result) => result.error)
      if (failedPage?.error) {
        console.error('[data] getTrendingBusinesses page error:', failedPage.error.message)
        return []
      }
      for (const result of pageResults) rows.push(...(result.data ?? []))
    }

    // Every published row participates in scoring, but only the winning candidates
    // need the additional contact/order-availability lookups performed by normalization.
    const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 10
    const ranked = sortByTrend(rows as Business[])
    return normalizeBusinesses(ranked.slice(0, safeLimit), supabase)
  },
  ['businesses-trending-v4'],
  { revalidate: 60, tags: ['businesses', 'trending'] },
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
        business:businesses(id, slug, name, area, is_verified, rating_avg, rating_count, successful_orders)
      `,
      )
      .eq('is_published', true)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[data] getActiveOffers error:', error.message)
      return []
    }
    return (data ?? []) as unknown as Offer[]
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
