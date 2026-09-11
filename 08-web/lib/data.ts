import { createClient } from '@/lib/supabase-server'
import { demoBusinesses, type DemoBusiness } from '@/lib/demo-data'

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
}

type DbOffer = { business_id: string; title: string; teaser_image_path: string | null; starts_at: string | null; ends_at: string | null; is_published: boolean }

function toDemoShape(b: DbBusiness, offer?: DbOffer | null): DemoBusiness {
  const type = b.business_type as DemoBusiness['type']
  const vibe = b.is_featured ? ['مميز'] : ['مناسب ليك']
  return {
    slug: b.slug,
    name: b.name,
    type: ['restaurant','pharmacy','supermarket','delivery_office'].includes(type) ? type as DemoBusiness['type'] : 'other',
    area: b.area ?? b.city ?? 'شبين القناطر',
    open: b.is_open,
    badge: b.is_featured ? 'مميز' : offer ? 'عرض' : undefined,
    vibe,
    reason: offer ? `عنده ${offer.title} دلوقتي` : b.description ?? 'اختيار متوافق مع احتياجك',
    menu: type === 'restaurant' ? [] : undefined,
  }
}

export async function getPublishedBusinesses(limit = 12, intent?: string) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('businesses')
      .select('id,business_type,name,slug,description,area,city,is_open,is_featured,is_published')
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (intent && ['restaurant','pharmacy','supermarket','delivery_office'].includes(intent)) {
      query = query.eq('business_type', intent)
    }

    const { data, error } = await query
    if (error || !data) return demoBusinesses.filter(b => !intent || b.type === intent).slice(0, limit)

    const ids = data.map((b) => b.id)
    if (!ids.length) return []
    const { data: offers } = await supabase
      .from('offers')
      .select('business_id,title,teaser_image_path,starts_at,ends_at,is_published')
      .in('business_id', ids)
      .eq('is_published', true)

    const now = Date.now()
    const activeOffers = (offers ?? []).filter(o => (!o.starts_at || new Date(o.starts_at).getTime() <= now) && (!o.ends_at || new Date(o.ends_at).getTime() >= now))
    return data.map(b => toDemoShape(b, activeOffers.find(o => o.business_id === b.id)))
  } catch {
    return demoBusinesses.filter(b => !intent || b.type === intent).slice(0, limit)
  }
}

export async function getBusinessBySlug(slug: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('businesses')
      .select('id,business_type,name,slug,description,area,city,is_open,is_featured,is_published')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
    if (!error && data) {
      const { data: offers } = await supabase.from('offers').select('business_id,title,teaser_image_path,starts_at,ends_at,is_published').eq('business_id', data.id).eq('is_published', true)
      return toDemoShape(data, offers?.[0] ?? null)
    }
  } catch {}
  return demoBusinesses.find(b => b.slug === slug) ?? null
}
