import { createClient } from '@/lib/supabase-server'
import { getSubscribedBusinessIds } from './subscription'

type DbBusiness = {
  id: string
  business_type: string
  name: string
  slug: string
  description: string | null
  area: string | null
  city: string | null
  is_open: boolean
  is_featured: boolean
  is_published: boolean
  hook?: string | null
  working_hours?: any
  created_at: string
  latitude?: number | null
  longitude?: number | null
  address_text?: string | null
  owner_profile_id?: string | null
  accepts_whatsapp_orders?: boolean | null
}

type DbOffer = {
  business_id: string
  title: string
  teaser_image_path: string | null
  starts_at: string | null
  ends_at: string | null
  is_published: boolean
}

type DbReview = {
  business_id: string
  taste: number
  value_for_money: number
  speed: number
  experience: number
  comment: string | null
  created_at: string
}

type BusinessViewModel = {
  businessId?: string
  name: string
  slug: string
  type: 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'
  area: string
  badge?: string
  vibe: string[]
  reason: string
  open: boolean
  featured?: boolean
  menu?: string[]
  hook?: string
  activeOffers?: number
  workingHours?: any
  is_premium?: boolean
  rating?: number
  reviewCount?: number
  recentComments?: number
  ageInDays?: number
  latitude?: number | null
  longitude?: number | null
  address?: string | null
  hasOwner?: boolean
  acceptsWhatsappOrders?: boolean
}

function toDemoShape(
  b: DbBusiness,
  offers?: DbOffer[],
  isPremium = false,
  reviewStats?: { rating: number; reviewCount: number; recentComments: number },
): BusinessViewModel {
  const type = b.business_type as BusinessViewModel['type']
  const validType = ['restaurant', 'pharmacy', 'supermarket', 'delivery_office'].includes(type)
    ? (type as 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office')
    : 'restaurant'

  const now = Date.now()
  const activeOffers = (offers ?? []).filter(
    (o) =>
      (!o.starts_at || new Date(o.starts_at).getTime() <= now) &&
      (!o.ends_at || new Date(o.ends_at).getTime() >= now)
  )
  const firstOffer = activeOffers[0]
  const ageInDays = Math.max(0, Math.floor((now - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24)))
  const rating = reviewStats?.rating ?? 0
  const reviewCount = reviewStats?.reviewCount ?? 0
  const recentComments = reviewStats?.recentComments ?? 0

  return {
    businessId: b.id,
    slug: b.slug,
    name: b.name,
    type: validType,
    area: b.area ?? b.city ?? 'شبين القناطر',
    open: b.is_open,
    badge: b.is_featured ? 'مميز' : firstOffer ? 'عرض' : undefined,
    vibe: b.is_featured ? ['مميز', 'الأعلى تقييماً'] : ['مناسب ليك'],
    reason: firstOffer
      ? `عنده ${firstOffer.title} دلوقتي`
      : b.description ?? 'اختيار متوافق مع احتياجك',
    menu: validType === 'restaurant' ? [] : undefined,
    hook: b.hook ?? undefined,
    activeOffers: activeOffers.length,
    is_premium: isPremium,
    workingHours: b.working_hours ?? undefined,
    rating,
    reviewCount,
    recentComments,
    ageInDays,
    latitude: b.latitude ?? null,
    longitude: b.longitude ?? null,
    address: b.address_text ?? null,
    hasOwner: !!b.owner_profile_id,
    acceptsWhatsappOrders: b.accepts_whatsapp_orders ?? false,
  }
}

const FALLBACK = (_limit: number, _intent?: string): BusinessViewModel[] => []

async function loadReviewStats(businessIds: string[]) {
  const stats = new Map<string, { rating: number; reviewCount: number; recentComments: number }>()
  if (!businessIds.length) return stats

  const supabase = await createClient()
  const { data } = await supabase
    .from('business_reviews')
    .select('business_id,taste,value_for_money,speed,experience,comment,created_at')
    .in('business_id', businessIds)
    .eq('status', 'approved')

  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  const buckets = new Map<string, DbReview[]>()

  for (const row of (data ?? []) as DbReview[]) {
    const list = buckets.get(row.business_id) ?? []
    list.push(row)
    buckets.set(row.business_id, list)
  }

  for (const [businessId, reviews] of buckets) {
    const n = reviews.length
    const rating = reviews.reduce(
      (sum, r) => sum + (r.taste + r.value_for_money + r.speed + r.experience) / 4,
      0,
    ) / n
    const recentComments = reviews.filter(
      (r) => Boolean(r.comment?.trim()) && new Date(r.created_at).getTime() >= cutoff,
    ).length
    stats.set(businessId, {
      rating: Math.round(rating * 10) / 10,
      reviewCount: n,
      recentComments,
    })
  }

  return stats
}

export async function getPublishedBusinesses(
  limit = 40,
  intent?: string
): Promise<BusinessViewModel[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('businesses')
      .select('id,business_type,name,slug,description,area,city,is_open,is_featured,is_published,hook,working_hours,created_at,latitude,longitude,address_text,owner_profile_id')
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (intent && ['restaurant', 'pharmacy', 'supermarket', 'delivery_office'].includes(intent)) {
      query = query.eq('business_type', intent)
    }

    const { data, error } = await query
    if (error || !data || data.length === 0) return FALLBACK(limit, intent)

    const ids = data.map((b) => b.id)
    if (!ids.length) return []

    const [{ data: offers }, premiumIds, reviewStats] = await Promise.all([
      supabase
        .from('offers')
        .select('business_id,title,teaser_image_path,starts_at,ends_at,is_published')
        .in('business_id', ids)
        .eq('is_published', true),
      getSubscribedBusinessIds(ids),
      loadReviewStats(ids),
    ])

    const offersByBiz = new Map<string, DbOffer[]>()
    ;(offers ?? []).forEach((o) => {
      const list = offersByBiz.get(o.business_id) ?? []
      list.push(o as DbOffer)
      offersByBiz.set(o.business_id, list)
    })

    return data.map((b) =>
      toDemoShape(b, offersByBiz.get(b.id) ?? [], premiumIds.has(b.id), reviewStats.get(b.id))
    )
  } catch {
    return FALLBACK(limit, intent)
  }
}

export async function getBusinessBySlug(slug: string): Promise<BusinessViewModel | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('businesses')
      .select('id,business_type,name,slug,description,area,city,is_open,is_featured,is_published,hook,working_hours,created_at')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (!error && data) {
      const [{ data: offers }, premiumIds, reviewStats] = await Promise.all([
        supabase
          .from('offers')
          .select('business_id,title,teaser_image_path,starts_at,ends_at,is_published')
          .eq('business_id', data.id)
          .eq('is_published', true),
        getSubscribedBusinessIds([data.id]),
        loadReviewStats([data.id]),
      ])
      return toDemoShape(data, offers ?? [], premiumIds.has(data.id), reviewStats.get(data.id))
    }
  } catch {
    /* silent */
  }
  return null
}

export async function getBusinessesWithStats(): Promise<BusinessViewModel[]> {
  return getPublishedBusinesses(50)
}
