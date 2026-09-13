import { createClient } from '@/lib/supabase-server'

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
}

type DbOffer = {
  business_id: string
  title: string
  teaser_image_path: string | null
  starts_at: string | null
  ends_at: string | null
  is_published: boolean
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
}

function toDemoShape(b: DbBusiness, offers?: DbOffer[]): BusinessViewModel {
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
    workingHours: b.working_hours ?? undefined,
  }
}

const FALLBACK = (_limit: number, _intent?: string): BusinessViewModel[] => []

export async function getPublishedBusinesses(
  limit = 40,
  intent?: string
): Promise<BusinessViewModel[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('businesses')
      .select('id,business_type,name,slug,description,area,city,is_open,is_featured,is_published,hook,working_hours')
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

    const { data: offers } = await supabase
      .from('offers')
      .select('business_id,title,teaser_image_path,starts_at,ends_at,is_published')
      .in('business_id', ids)
      .eq('is_published', true)

    const offersByBiz = new Map<string, DbOffer[]>()
    ;(offers ?? []).forEach((o) => {
      const list = offersByBiz.get(o.business_id) ?? []
      list.push(o as DbOffer)
      offersByBiz.set(o.business_id, list)
    })

    return data.map((b) => toDemoShape(b, offersByBiz.get(b.id) ?? []))
  } catch {
    return FALLBACK(limit, intent)
  }
}

export async function getBusinessBySlug(slug: string): Promise<BusinessViewModel | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('businesses')
      .select('id,business_type,name,slug,description,area,city,is_open,is_featured,is_published,hook,working_hours')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (!error && data) {
      const { data: offers } = await supabase
        .from('offers')
        .select('business_id,title,teaser_image_path,starts_at,ends_at,is_published')
        .eq('business_id', data.id)
        .eq('is_published', true)

      return toDemoShape(data, offers ?? [])
    }
  } catch {
    /* silent */
  }
  return null
}

export async function getBusinessesWithStats(): Promise<BusinessViewModel[]> {
  return getPublishedBusinesses(50)
}
