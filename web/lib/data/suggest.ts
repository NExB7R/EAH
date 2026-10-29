import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getWhatsAppDestinationBusinessIds } from './contact-availability'
import { isWhatsAppChannelAvailable } from './contact-availability-utils'
import type { Business, BusinessType } from './businesses'

// ═══════════════════════════════════════════════════════════
// EAH — Suggested Businesses (Recommendation)
//   • للمسجل: بناءً على المفضلات + المتابعات + الأنواع
//   • للزائر: الأعلى تقييماً في المنطقة
// ═══════════════════════════════════════════════════════════

type SuggestedResult = {
  businesses: Business[]
  reason: 'personal' | 'trending' | 'new_user'
}

const MAX_RESULTS = 12
const AREA_DEFAULT = 'شبين القناطر'

const BUSINESS_COLUMNS = `
  id, slug, name, business_type, description, hook,
  area, city, address_text, map_url, cover_image_url,
  is_open, is_featured, is_new_project, is_opportunity, opportunity_until, opportunity_note,
  successful_orders,
  featured_order, featured_until, featured_pin,
  new_until, working_hours, accepts_whatsapp_orders,
  response_time_avg_seconds, response_rate,
  last_activity_at, created_at, updated_at,
  branches_count, offers_count, rating_avg, rating_count,
  business_locations(latitude, longitude, is_primary)
`

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
  return { ...(rest as unknown as Business), location: loc }
}

async function normalizeBusinesses(data: unknown[] | null): Promise<Business[]> {
  if (!data || data.length === 0) return []
  const rows = data.map((row) => row as Record<string, unknown>)
  let configuredWhatsAppIds = new Set<string>()

  try {
    configuredWhatsAppIds = await getWhatsAppDestinationBusinessIds(
      createServiceClient(),
      rows.map((row) => String(row.id ?? '')),
    )
  } catch (error) {
    console.error('[suggest] WhatsApp availability lookup failed:', error)
  }

  return rows.map((row) =>
    normalizeBusiness({
      ...row,
      accepts_whatsapp_orders: isWhatsAppChannelAvailable(
        row.accepts_whatsapp_orders,
        row.id,
        configuredWhatsAppIds,
      ),
    }),
  )
}

// ─── Top-rated fallback ───

const getTopRated = unstable_cache(
  async (limit = MAX_RESULTS): Promise<Business[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      .order('rating_count', { ascending: false })
      .order('rating_avg', { ascending: false })
      .order('successful_orders', { ascending: false })
      .order('is_verified', { ascending: false })
      .order('rating_avg', { ascending: false })
      .limit(limit)

    if (error) return []
    return await normalizeBusinesses(data)
  },
  ['suggest-top-rated-v2'],
  { revalidate: 300, tags: ['businesses'] },
)

// ─── Building suggestions from user's profile ───

async function getUserBusinessTypes(userId: string): Promise<{
  types: BusinessType[]
  seenIds: Set<string>
  hasHistory: boolean
}> {
  const supabase = await createClient()

  const [favRes, followRes] = await Promise.all([
    supabase
      .from('favorites')
      .select('business:businesses(business_type)')
      .eq('user_id', userId)
      .limit(50),
    supabase
      .from('business_follows')
      .select('business:businesses(business_type)')
      .eq('user_id', userId)
      .limit(50),
  ])

  const types: BusinessType[] = []
  const seenIds = new Set<string>()

  const collect = (rows: unknown[] | null) => {
    if (!rows) return
    for (const r of rows) {
      const biz = (r as { business?: { business_type?: BusinessType } | null }).business
      if (biz?.business_type) types.push(biz.business_type)
    }
  }

  collect(favRes.data)
  collect(followRes.data)

  // جيب IDs المفضلات والمتابعات نفسها
  const [favIds, followIds] = await Promise.all([
    supabase.from('favorites').select('business_id').eq('user_id', userId).limit(50),
    supabase.from('business_follows').select('business_id').eq('user_id', userId).limit(50),
  ])

  for (const r of favIds.data ?? []) {
    seenIds.add((r as { business_id: string }).business_id)
  }
  for (const r of followIds.data ?? []) {
    seenIds.add((r as { business_id: string }).business_id)
  }

  return { types, seenIds, hasHistory: types.length > 0 }
}

function rankTypes(types: BusinessType[]): BusinessType[] {
  const counts = new Map<BusinessType, number>()
  for (const t of types) counts.set(t, (counts.get(t) ?? 0) + 1)
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t)
}

// ─── Main fetcher ───

export async function getSuggestedBusinesses(userId: string | null): Promise<SuggestedResult> {
  // Guest — الأعلى تقييماً
  if (!userId) {
    const top = await getTopRated(MAX_RESULTS)
    return { businesses: top, reason: 'new_user' }
  }

  const { types, seenIds, hasHistory } = await getUserBusinessTypes(userId)

  // مسجل بس مفيش تاريخ — الأعلى في المنطقة
  if (!hasHistory) {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('businesses')
      .select(BUSINESS_COLUMNS)
      .eq('is_published', true)
      .eq('area', AREA_DEFAULT)
      .order('rating_count', { ascending: false })
      .order('rating_avg', { ascending: false })
      .order('successful_orders', { ascending: false })
      .order('is_verified', { ascending: false })
      .limit(MAX_RESULTS)

    const businesses = await normalizeBusinesses(data)
    if (businesses.length >= 6) {
      return { businesses, reason: 'new_user' }
    }

    // Fallback للأعلى تقييماً
    const top = await getTopRated(MAX_RESULTS)
    return { businesses: top, reason: 'new_user' }
  }

  // مسجل وعنده تاريخ — بناءً على الأنواع
  const rankedTypes = rankTypes(types).slice(0, 3) // أفضل 3 أنواع

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('businesses')
    .select(BUSINESS_COLUMNS)
    .eq('is_published', true)
    .in('business_type', rankedTypes)
    .order('rating_count', { ascending: false })
      .order('rating_avg', { ascending: false })
      .order('successful_orders', { ascending: false })
      .order('is_verified', { ascending: false })
    .limit(MAX_RESULTS + 10) // هامش للاستبعاد

  if (error) {
    const top = await getTopRated(MAX_RESULTS)
    return { businesses: top, reason: 'trending' }
  }

  const candidates = await normalizeBusinesses(data)
  const filtered = candidates.filter((b) => !seenIds.has(b.id)).slice(0, MAX_RESULTS)

  // لو أقل من 6 → نكمل من الأعلى تقييماً
  if (filtered.length < 6) {
    const top = await getTopRated(MAX_RESULTS)
    const merged = [...filtered]
    const ids = new Set(merged.map((b) => b.id))
    for (const b of top) {
      if (!ids.has(b.id) && !seenIds.has(b.id)) {
        merged.push(b)
        ids.add(b.id)
      }
      if (merged.length >= MAX_RESULTS) break
    }
    return { businesses: merged, reason: 'personal' }
  }

  return { businesses: filtered, reason: 'personal' }
}
