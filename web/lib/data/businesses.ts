import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { sortByTrend } from '@/lib/ranking'

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
  trust_score: number
  trust_tier: string
  velocity_score: number
  engagement_score: number
  diversity_score: number
  successful_orders: number
  featured_order: number
  featured_until: string | null
  featured_pin: boolean
  new_until: string | null
  working_hours: WorkingHours | null
  accepts_whatsapp_orders: boolean
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

// تحديد يوم الأسبوع بالإنجليزي
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

function todayKey(): string {
  const d = new Date()
  return DAY_KEYS[d.getDay()] ?? 'sun'
}

function nowMinutes(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10))
  return (h ?? 0) * 60 + (m ?? 0)
}

// هل النشاط مفتوح دلوقتي؟ (من working_hours)
export function isOpenNow(hours: WorkingHours | null): boolean {
  if (!hours) return false
  const key = todayKey()
  const day = hours[key]
  if (!day) return false

  const now = nowMinutes()
  const open = hhmmToMinutes(day.open)
  const close = hhmmToMinutes(day.close)

  // لو close بعد open (عادي)
  if (close > open) return now >= open && now < close
  // لو close بعد منتصف الليل (مثلاً 02:00)
  return now >= open || now < close
}

// ═══════════════════════════════════════════════════════════
// Select columns (نفس الترتيب في كل query)
// ═══════════════════════════════════════════════════════════

const BUSINESS_COLUMNS = `
  id, slug, name, business_type, custom_business_type, business_type_status, subcategory, description, hook,
  area, city, address_text, map_url, cover_image_url, logo_url,
  is_open, is_featured, is_verified, verified_at, is_new_project, is_opportunity, opportunity_until, opportunity_note,
  trust_score, trust_tier, velocity_score, engagement_score, diversity_score, successful_orders,
  featured_order, featured_until, featured_pin,
  new_until, working_hours, accepts_whatsapp_orders, accepts_orders,
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
  // Public availability is denormalized onto businesses so public reads never need
  // permission to inspect the private merchant_order_settings table.
  const orders_enabled = raw.accepts_orders === true

  const rest: Record<string, unknown> = { ...raw }
  delete rest.business_locations
  delete rest.accepts_orders
  return { ...(rest as unknown as Business), location: loc, orders_enabled }
}

function normalizeBusinesses(data: unknown[] | null): Business[] {
  if (!data) return []
  return data.map((r) => normalizeBusiness(r as Record<string, unknown>))
}

// ═══════════════════════════════════════════════════════════
// 1. كل الأنشطة المنشورة (للـ Home)
// ═══════════════════════════════════════════════════════════

export const getPublishedBusinesses = unstable_cache(
  async (): Promise<Business[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      .order('trust_score', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[data] getPublishedBusinesses error:', error.message)
      return []
    }
    return normalizeBusinesses(data)
  },
  ['businesses-published-v2'],
  { revalidate: 300, tags: ['businesses'] },
)

// ═══════════════════════════════════════════════════════════
// 2. الأنشطة المميزة (Featured)
// ═══════════════════════════════════════════════════════════

export const getFeaturedBusinesses = unstable_cache(
  async (limit = 6): Promise<Business[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('featured_pin', { ascending: false })
      .order('featured_order', { ascending: true })
      .order('trust_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[data] getFeaturedBusinesses error:', error.message)
      return []
    }
    return normalizeBusinesses(data)
  },
  ['businesses-featured-v2'],
  { revalidate: 300, tags: ['businesses', 'featured'] },
)

// ═══════════════════════════════════════════════════════════
// 3. بدايات (New projects — مشاريع لسه فاتحة)
// ═══════════════════════════════════════════════════════════

export const getNewBusinesses = unstable_cache(
  async (limit = 10): Promise<Business[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      .eq('is_new_project', true)
      .order('new_until', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[data] getNewBusinesses error:', error.message)
      return []
    }
    return normalizeBusinesses(data)
  },
  ['businesses-new-v2'],
  { revalidate: 300, tags: ['businesses', 'new'] },
)

// ═══════════════════════════════════════════════════════════
// 4. حسب النوع (للتصنيفات)
// ═══════════════════════════════════════════════════════════

export const getBusinessesByType = unstable_cache(
  async (type: BusinessType, limit = 20): Promise<Business[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      .eq('business_type', type)
      .order('trust_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[data] getBusinessesByType error:', error.message)
      return []
    }
    return normalizeBusinesses(data)
  },
  ['businesses-by-type-v2'],
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
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      .order('successful_orders', { ascending: false })
      .limit(limit * 3)

    if (error) {
      console.error('[data] getTrendingBusinesses error:', error.message)
      return []
    }
    return sortByTrend(normalizeBusinesses(data)).slice(0, limit)
  },
  ['businesses-trending-v2'],
  { revalidate: 300, tags: ['businesses', 'trending'] },
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
    trust_score: number
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
        business:businesses(id, slug, name, area, trust_score)
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
    const supabase = createPublicClient()
    let q = supabase.from('businesses').select(BUSINESS_COLUMNS).eq('is_published', true)

    if (area) q = q.eq('area', area)

    const { data, error } = await q.order('trust_score', { ascending: false }).limit(limit)

    if (error) {
      console.error('[data] getNearbyBusinesses error:', error.message)
      return []
    }
    return normalizeBusinesses(data)
  },
  ['businesses-nearby-v2'],
  { revalidate: 300, tags: ['businesses'] },
)
