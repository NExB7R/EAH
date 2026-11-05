import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import { createServiceClient } from '@/lib/supabase/service'
import { isBusinessOpen, isOpenNow, type Business, type WorkingHours } from './businesses'
import { getWhatsAppDestinationBusinessIds } from './contact-availability'
import { getInAppOrderAvailableBusinessIds } from './in-app-order-availability'
import { buildContactOptions, safeContactOptionLabel, type ContactOption } from './contact-options'
export type { ContactOption } from './contact-options'
import { isWhatsAppChannelAvailable } from './contact-availability-utils'
import { isPromotionActive } from './promotion-status'
import { filterPublicContactMethods, type PublicContactMethod } from './public-contacts'

// ═══════════════════════════════════════════════════════════
// EAH — Business Detail (Full Page Data)
// ═══════════════════════════════════════════════════════════

async function normalizeBusinessRows(
  data: unknown[] | null,
  supabase: ReturnType<typeof createServiceClient>,
): Promise<Business[]> {
  if (!data || data.length === 0) return []
  const rows = data.map((row) => ({ ...(row as Record<string, unknown>) }))
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
  return rows.map((raw) => {
    const locRaw = raw.business_locations
    const locArr = Array.isArray(locRaw)
      ? (locRaw as { latitude: number; longitude: number; is_primary: boolean }[])
      : []
    const primaryLoc = locArr.find((l) => l.is_primary) ?? locArr[0]
    const location =
      primaryLoc && Number.isFinite(primaryLoc.latitude) && Number.isFinite(primaryLoc.longitude)
        ? { lat: primaryLoc.latitude, lng: primaryLoc.longitude }
        : null
    const acceptsOrders = configuredInAppOrderIds.has(String(raw.id ?? ''))
    const acceptsWhatsApp = isWhatsAppChannelAvailable(
      raw.accepts_whatsapp_orders,
      raw.id,
      configuredWhatsAppIds,
    )
    const isOpen = isBusinessOpen({
      working_hours: (raw.working_hours as WorkingHours | null) ?? null,
      open_now_override:
        typeof raw.open_now_override === 'boolean' ? raw.open_now_override : null,
      is_open: typeof raw.is_open === 'boolean' ? raw.is_open : null,
    })
    delete raw.business_locations
    // Do not leak the internal owner profile ID through public detail/similar-business payloads.
    delete raw.owner_profile_id
    return {
      ...(raw as unknown as Business),
      location,
      is_open: isOpen,
      is_featured: isPromotionActive(raw.is_featured === true, raw.featured_until),
      is_new_project: isPromotionActive(raw.is_new_project === true, raw.new_until),
      accepts_orders: acceptsOrders,
      accepts_whatsapp_orders: acceptsWhatsApp,
      orders_enabled: acceptsOrders,
    }
  })
}

export type MediaItem = {
  id: string
  media_type: 'logo' | 'cover' | 'gallery' | 'menu'
  storage_path: string
  alt_text: string | null
  sort_order: number
}

export type Branch = {
  id: string
  name: string
  area: string | null
  address_text: string | null
  latitude: number | null
  longitude: number | null
  is_primary: boolean
}

export type Review = {
  id: string
  user_id: string
  dimensions: Record<string, number> | null
  comment: string | null
  status: string
  created_at: string
  merchant_reply: string | null
  merchant_reply_at: string | null
  review_quality_score: number
  is_verified_transaction: boolean
  reviewer: {
    display_name: string
    avatar_url: string | null
  } | null
}

export type BusinessNoticeData = {
  text: string
  severity: 'info' | 'warning' | 'critical'
  expiresAt: string | null
}

export function computeIsOpenNow(
  override: boolean | null | undefined,
  hours: Parameters<typeof isOpenNow>[0],
): boolean {
  if (override !== null && override !== undefined) return override
  return isOpenNow(hours)
}

export type BusinessDetail = {
  business: Omit<Business, 'owner_profile_id'>
  contacts: PublicContactMethod[]
  contactOptions: ContactOption[]
  media: MediaItem[]
  branches: Branch[]
  menu: MediaItem[]
  gallery: MediaItem[]
  logo: MediaItem | null
  cover: MediaItem | null
  notice: BusinessNoticeData | null
  openNowOverride: boolean | null
}

// ═══════════════════════════════════════════════════════════
// 1. Full Business Detail (slug)
// ═══════════════════════════════════════════════════════════

/**
 * Check ownership for the signed-in user without exposing owner_profile_id
 * through the anonymous public business-detail payload.
 *
 * Call from a server component after authenticating the user. RLS remains the
 * authority: this query returns a row only when the signed-in user can read
 * the published business and its owner_profile_id matches their own ID.
 */
export async function isBusinessOwner(businessId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('owner_profile_id', userId)
    .eq('is_published', true)
    .limit(1)
    .maybeSingle()

  if (error) return false
  return !!data
}

export const getBusinessDetail = unstable_cache(
  async (slug: string): Promise<BusinessDetail | null> => {
    const supabase = createServiceClient()

    // 1. Business
    const { data: biz } = await supabase
      .from('businesses')
      .select(
        `
        id, slug, name, owner_profile_id, business_type, custom_business_type, business_type_status, description, hook,
        area, city, address_text, map_url, cover_image_url,
        is_open, is_featured, is_verified, verified_at, is_new_project, is_opportunity, opportunity_until, opportunity_note,
        successful_orders,
        featured_order, featured_until, featured_pin,
        new_until, working_hours, accepts_whatsapp_orders, accepts_orders,
        response_time_avg_seconds, response_rate,
        last_activity_at, created_at, updated_at,
        branches_count, offers_count, rating_avg, rating_count,
        important_notice, notice_expires_at, notice_severity, open_now_override,
        business_locations(latitude, longitude, is_primary)
      `,
      )
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (!biz) return null

    const rawBiz = biz as unknown as Record<string, unknown>
    const locRaw = rawBiz.business_locations
    const locArr = Array.isArray(locRaw)
      ? (locRaw as { latitude: number; longitude: number; is_primary: boolean }[])
      : []
    const primaryLoc = locArr.find((l) => l.is_primary) ?? locArr[0]
    const location =
      primaryLoc && Number.isFinite(primaryLoc.latitude) && Number.isFinite(primaryLoc.longitude)
        ? { lat: primaryLoc.latitude, lng: primaryLoc.longitude }
        : null
    const [configuredWhatsAppIds, configuredInAppOrderIds] = await Promise.all([
      getWhatsAppDestinationBusinessIds(supabase, [String(rawBiz.id)]),
      getInAppOrderAvailableBusinessIds(supabase, [{
        id: String(rawBiz.id),
        accepts_orders: rawBiz.accepts_orders,
        owner_profile_id: rawBiz.owner_profile_id,
      }]),
    ])
    const acceptsOrders = configuredInAppOrderIds.has(String(rawBiz.id))
    const acceptsWhatsApp = isWhatsAppChannelAvailable(
      rawBiz.accepts_whatsapp_orders,
      rawBiz.id,
      configuredWhatsAppIds,
    )
    delete rawBiz.business_locations
    // Owner IDs are private linkage data; return only the derived availability flag.
    delete rawBiz.owner_profile_id
    const business = {
      ...(rawBiz as unknown as Omit<Business, 'owner_profile_id'>),
      location,
      is_open: isBusinessOpen({
        working_hours: (rawBiz.working_hours as WorkingHours | null) ?? null,
        open_now_override:
          typeof rawBiz.open_now_override === 'boolean' ? rawBiz.open_now_override : null,
        is_open: typeof rawBiz.is_open === 'boolean' ? rawBiz.is_open : null,
      }),
      is_featured: isPromotionActive(rawBiz.is_featured === true, rawBiz.featured_until),
      is_new_project: isPromotionActive(rawBiz.is_new_project === true, rawBiz.new_until),
      accepts_orders: acceptsOrders,
      accepts_whatsapp_orders: acceptsWhatsApp,
      orders_enabled: acceptsOrders,
    }

    const noticeText = ((rawBiz.important_notice as string | null) ?? '').trim()
    const noticeExpiresAt = (rawBiz.notice_expires_at as string | null) ?? null
    const noticeSeverityRaw = (rawBiz.notice_severity as string | null) ?? 'info'
    const noticeSeverity: 'info' | 'warning' | 'critical' =
      noticeSeverityRaw === 'warning' || noticeSeverityRaw === 'critical'
        ? noticeSeverityRaw
        : 'info'
    const openNowOverride = (rawBiz.open_now_override as boolean | null) ?? null
    const noticeExpired = noticeExpiresAt !== null && new Date(noticeExpiresAt) <= new Date()
    const notice: BusinessNoticeData | null =
      noticeText && !noticeExpired
        ? { text: noticeText, severity: noticeSeverity, expiresAt: noticeExpiresAt }
        : null

    // 2. Parallel: contacts + media + branches
    const [contactsRes, mediaRes, branchesRes, contactOptionsRes] = await Promise.all([
      supabase
        .from('business_contact_methods')
        .select('method_type, value, is_primary')
        .eq('business_id', business.id)
        .eq('is_public', true)
        .in('method_type', ['facebook', 'instagram', 'website'])
        .order('is_primary', { ascending: false }),
      supabase
        .from('business_media')
        .select('id, media_type, storage_path, alt_text, sort_order')
        .eq('business_id', business.id)
        .eq('is_published', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('business_branches')
        .select('id, name, area, address_text, latitude, longitude, is_primary, phone, whatsapp, sort_order')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .order('sort_order', { ascending: true }),
      supabase
        .from('business_contact_methods')
        .select('id, method_type, value, label, is_primary, sort_order')
        .eq('business_id', business.id)
        .eq('is_public', true)
        .in('method_type', ['phone', 'whatsapp'])
        .order('is_primary', { ascending: false })
        .order('sort_order', { ascending: true }),
    ])

    const contacts = filterPublicContactMethods(
      (contactsRes.data ?? []) as { method_type: string; value: string; is_primary: boolean }[],
    )
    const media = (mediaRes.data ?? []) as MediaItem[]
    type RawBranch = Branch & {
      phone: string | null
      whatsapp: string | null
      sort_order: number | null
    }
    const rawBranches = (branchesRes.data ?? []) as unknown as RawBranch[]
    // Only the non-sensitive branch fields may be serialized to the browser.
    const branches: Branch[] = rawBranches.map((branch) => ({
      id: branch.id,
      name: safeContactOptionLabel(branch.name, branch.is_primary ? 'الفرع الرئيسي' : 'فرع النشاط'),
      area: branch.area,
      address_text: branch.address_text,
      latitude: branch.latitude,
      longitude: branch.longitude,
      is_primary: branch.is_primary,
    }))

    type RawContactOption = {
      id: string
      method_type: string
      value: string
      label: string | null
      is_primary: boolean
      sort_order: number | null
    }
    const rawContactOptions = (contactOptionsRes.data ?? []) as unknown as RawContactOption[]
    const contactOptions = buildContactOptions(
      rawBranches,
      rawContactOptions,
    )

    const logo = media.find((m) => m.media_type === 'logo') ?? null
    const cover = media.find((m) => m.media_type === 'cover') ?? null
    const menu = media.filter((m) => m.media_type === 'menu')
    const gallery = media.filter((m) => m.media_type === 'gallery')

    return {
      business,
      contacts,
      contactOptions,
      media,
      branches,
      menu,
      gallery,
      logo,
      cover,
      notice,
      openNowOverride,
    }
  },
  ['business-detail-v5'],
  { revalidate: 60, tags: ['businesses'] },
)

// ═══════════════════════════════════════════════════════════
// 2. Reviews (approved only — public)
// ═══════════════════════════════════════════════════════════

export const getBusinessReviews = unstable_cache(
  async (businessId: string, limit = 50): Promise<Review[]> => {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('business_reviews')
      .select(
        `
        id, user_id, dimensions, comment, status, created_at,
        merchant_reply, merchant_reply_at,
        reviewer:profiles(display_name, avatar_url)
      `,
      )
      .eq('business_id', businessId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit)

    return (data ?? []) as unknown as Review[]
  },
  ['business-reviews-v1'],
  { revalidate: 120, tags: ['reviews'] },
)

export type ReviewStats = {
  count: number
  avg: number
  breakdown: Record<string, number>
}

export function computeReviewStats(reviews: Review[]): ReviewStats {
  if (reviews.length === 0) {
    return { count: 0, avg: 0, breakdown: {} }
  }

  const sum: Record<string, number> = {}
  const cnt: Record<string, number> = {}
  let overallTotal = 0
  let overallCount = 0

  for (const r of reviews) {
    const dims = r.dimensions ?? {}
    const values: number[] = []
    for (const [key, v] of Object.entries(dims)) {
      if (typeof v === 'number' && v >= 1 && v <= 5) {
        sum[key] = (sum[key] ?? 0) + v
        cnt[key] = (cnt[key] ?? 0) + 1
        values.push(v)
      }
    }
    if (values.length > 0) {
      overallTotal += values.reduce((a, b) => a + b, 0) / values.length
      overallCount += 1
    }
  }

  const breakdown: Record<string, number> = {}
  for (const key of Object.keys(sum)) {
    const s = sum[key] ?? 0
    const c = cnt[key] ?? 0
    if (c > 0) breakdown[key] = Math.round((s / c) * 10) / 10
  }

  return {
    count: reviews.length,
    avg: overallCount > 0 ? Math.round((overallTotal / overallCount) * 10) / 10 : 0,
    breakdown,
  }
}

// ─── Eligibility: only a delivered platform order can unlock a review ───
export async function hasDeliveredOrderForReview(
  businessId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('order_requests')
    .select('id')
    .eq('business_id', businessId)
    .eq('customer_profile_id', userId)
    .eq('status', 'delivered')
    .limit(1)
    .maybeSingle()

  return !error && !!data
}

// ─── فحص هل المستخدم قيّم قبل كده ───
export async function getUserReview(businessId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_reviews')
    .select('id, status')
    .eq('business_id', businessId)
    .eq('user_id', userId)
    .maybeSingle()
  return data as { id: string; status: string } | null
}

// ═══════════════════════════════════════════════════════════
// 3. Similar Businesses (for discovery)
// ═══════════════════════════════════════════════════════════

export const getSimilarBusinesses = unstable_cache(
  async (businessId: string, businessType: string, limit = 8): Promise<Business[]> => {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('businesses')
      .select(
        `
        id, slug, name, owner_profile_id, business_type, description, hook,
        area, city, address_text, map_url, cover_image_url,
        is_open, is_featured, is_verified, verified_at, is_new_project, is_opportunity, opportunity_until, opportunity_note,
        successful_orders,
        featured_order, featured_until, featured_pin,
        new_until, working_hours, open_now_override, accepts_whatsapp_orders, accepts_orders,
        response_time_avg_seconds, response_rate,
        last_activity_at, created_at, updated_at,
        branches_count, offers_count, rating_avg, rating_count,
        business_locations(latitude, longitude, is_primary)
      `,
      )
      .eq('business_type', businessType)
      .eq('is_published', true)
      .neq('id', businessId)
      .order('is_verified', { ascending: false })
      .order('rating_count', { ascending: false })
      .order('rating_avg', { ascending: false })
      .order('successful_orders', { ascending: false })
      .limit(limit)

    return await normalizeBusinessRows(data, supabase)
  },
  ['business-similar-v4'],
  { revalidate: 60, tags: ['businesses'] },
)

// ═══════════════════════════════════════════════════════════
// 4. Sub-categories Map (للعرض في UI)
// ═══════════════════════════════════════════════════════════

export const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  delivery_office: 'توصيل',
  misc: 'أخرى',
}

// ═══════════════════════════════════════════════════════════
// Business Activity Stats
// ═══════════════════════════════════════════════════════════

export async function getUserActivity(
  businessId: string,
  userId: string,
  type: 'follow' | 'favorite',
): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_activities')
    .select('id')
    .eq('business_id', businessId)
    .eq('user_id', userId)
    .eq('activity_type', type)
    .maybeSingle()
  return !!data
}

// ═══════════════════════════════════════════════════════════
// Business Offers (للـ OrderModal)
// ═══════════════════════════════════════════════════════════

export type BusinessOfferSimple = {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  teaser_image_url: string | null
  ends_at: string | null
}

export async function getBusinessOffers(
  businessId: string,
  limit = 6,
): Promise<BusinessOfferSimple[]> {
  const supabase = createPublicClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('offers')
    .select('id, title, description, price, image_url, teaser_image_url, ends_at')
    .eq('business_id', businessId)
    .eq('is_published', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return (data ?? []) as BusinessOfferSimple[]
}
