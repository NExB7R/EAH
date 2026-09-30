import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { sortByTrend } from '@/lib/ranking'

// ═══════════════════════════════════════════════════════════
// EAH — Data Fetching Layer
// ═══════════════════════════════════════════════════════════

export type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office' | 'misc'

export type WorkingDay = {
  open: string
  close: string
}

export type WorkingHours = Record<string, WorkingDay>

export type Business = {
  id: string
  slug: string
  name: string
  owner_profile_id: string
  business_type: BusinessType
  description: string | null
  hook: string | null
  area: string | null
  city: string | null
  address_text: string | null
  map_url: string | null
  cover_image_url: string | null
  is_open: boolean
  is_featured: boolean
  is_new_project: boolean
  is_opportunity: boolean
  opportunity_until: string | null
  opportunity_note: string | null
  trust_score: number
  trust_tier: string
  successful_orders: number
  featured_order: number
  featured_until: string | null
  featured_pin: boolean
  new_until: string | null
  working_hours: WorkingHours | null
  accepts_whatsapp_orders: boolean
  response_time_avg_seconds: number | null
  response_rate: number | null
  last_activity_at: string | null
  branches_count: number
  offers_count: number
  rating_avg: number
  rating_count: number
  created_at: string
  updated_at: string
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

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
  id, slug, name, business_type, description, hook,
  area, city, address_text, map_url, cover_image_url,
  is_open, is_featured, is_new_project, is_opportunity, opportunity_until, opportunity_note,
  trust_score, trust_tier, successful_orders,
  featured_order, featured_until, featured_pin,
  new_until, working_hours, accepts_whatsapp_orders,
  response_time_avg_seconds, response_rate,
  last_activity_at, created_at, updated_at,
  branches_count, offers_count, rating_avg, rating_count
`

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
    return (data ?? []) as Business[]
  },
  ['businesses-published'],
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
    return (data ?? []) as Business[]
  },
  ['businesses-featured'],
  { revalidate: 300, tags: ['businesses', 'featured'] },
)

// ═══════════════════════════════════════════════════════════
// 3. الأنشطة الجديدة (New projects)
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
    return (data ?? []) as Business[]
  },
  ['businesses-new'],
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
    return (data ?? []) as Business[]
  },
  ['businesses-by-type'],
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
    return sortByTrend((data ?? []) as Business[]).slice(0, limit)
  },
  ['businesses-trending'],
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
  business: {
    id: string
    slug: string
    name: string
    area: string | null
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
        id, title, description, price, image_url, starts_at, ends_at,
        business:businesses(id, slug, name, area)
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
    return (data ?? []) as Business[]
  },
  ['businesses-nearby'],
  { revalidate: 300, tags: ['businesses'] },
)
