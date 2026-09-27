import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import type { Business } from './businesses'

// ═══════════════════════════════════════════════════════════
// EAH — Business Detail (Full Page Data)
// ═══════════════════════════════════════════════════════════

export type ContactMethod = {
  method_type: 'phone' | 'whatsapp' | 'facebook' | 'instagram' | 'website' | 'email'
  value: string
  is_primary: boolean
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
  phone: string | null
  whatsapp: string | null
  is_primary: boolean
}

export type Review = {
  id: string
  taste: number | null
  value_for_money: number | null
  speed: number | null
  experience: number | null
  comment: string | null
  status: string
  created_at: string
  merchant_reply: string | null
  merchant_reply_at: string | null
  reviewer: {
    display_name: string
    avatar_url: string | null
  } | null
}

export type BusinessDetail = {
  business: Business
  contacts: ContactMethod[]
  media: MediaItem[]
  branches: Branch[]
  menu: MediaItem[]
  gallery: MediaItem[]
  logo: MediaItem | null
  cover: MediaItem | null
}

// ═══════════════════════════════════════════════════════════
// 1. Full Business Detail (slug)
// ═══════════════════════════════════════════════════════════

export const getBusinessDetail = unstable_cache(
  async (slug: string): Promise<BusinessDetail | null> => {
    const supabase = createPublicClient()

    // 1. Business
    const { data: biz } = await supabase
      .from('businesses')
      .select(`
        id, slug, name, business_type, description, hook,
        area, city, address_text, map_url, cover_image_url,
        is_open, is_featured, is_new_project, is_opportunity, opportunity_until, opportunity_note,
        trust_score, trust_tier, successful_orders,
        featured_order, featured_until, featured_pin,
        new_until, working_hours, accepts_whatsapp_orders,
        response_time_avg_seconds, response_rate,
        last_activity_at, created_at, updated_at,
        branches_count, offers_count, rating_avg, rating_count
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (!biz) return null

    const business = biz as unknown as Business

    // 2. Parallel: contacts + media + branches
    const [contactsRes, mediaRes, branchesRes] = await Promise.all([
      supabase
        .from('business_contact_methods')
        .select('method_type, value, is_primary')
        .eq('business_id', business.id)
        .eq('is_public', true)
        .order('is_primary', { ascending: false }),
      supabase
        .from('business_media')
        .select('id, media_type, storage_path, alt_text, sort_order')
        .eq('business_id', business.id)
        .eq('is_published', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('business_branches')
        .select('id, name, area, address_text, latitude, longitude, phone, whatsapp, is_primary')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false }),
    ])

    const contacts = (contactsRes.data ?? []) as ContactMethod[]
    const media = (mediaRes.data ?? []) as MediaItem[]
    const branches = (branchesRes.data ?? []) as Branch[]

    const logo = media.find((m) => m.media_type === 'logo') ?? null
    const cover = media.find((m) => m.media_type === 'cover') ?? null
    const menu = media.filter((m) => m.media_type === 'menu')
    const gallery = media.filter((m) => m.media_type === 'gallery')

    return {
      business,
      contacts,
      media,
      branches,
      menu,
      gallery,
      logo,
      cover,
    }
  },
  ['business-detail-v1'],
  { revalidate: 120, tags: ['businesses'] },
)

// ═══════════════════════════════════════════════════════════
// 2. Reviews (approved only — public)
// ═══════════════════════════════════════════════════════════

export const getBusinessReviews = unstable_cache(
  async (businessId: string, limit = 50): Promise<Review[]> => {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('business_reviews')
      .select(`
        id, taste, value_for_money, speed, experience,
        comment, status, created_at,
        merchant_reply, merchant_reply_at,
        reviewer:profiles(display_name, avatar_url)
      `)
      .eq('business_id', businessId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit)

    return (data ?? []) as unknown as Review[]
  },
  ['business-reviews-v1'],
  { revalidate: 120, tags: ['reviews'] },
)

// ═══════════════════════════════════════════════════════════
// 3. Similar Businesses (for discovery)
// ═══════════════════════════════════════════════════════════

export const getSimilarBusinesses = unstable_cache(
  async (businessId: string, businessType: string, limit = 8): Promise<Business[]> => {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('businesses')
      .select(`
        id, slug, name, business_type, description, hook,
        area, city, address_text, map_url, cover_image_url,
        is_open, is_featured, is_new_project, is_opportunity, opportunity_until, opportunity_note,
        trust_score, trust_tier, successful_orders,
        featured_order, featured_until, featured_pin,
        new_until, working_hours, accepts_whatsapp_orders,
        response_time_avg_seconds, response_rate,
        last_activity_at, created_at, updated_at,
        branches_count, offers_count, rating_avg, rating_count
      `)
      .eq('business_type', businessType)
      .eq('is_published', true)
      .neq('id', businessId)
      .order('trust_score', { ascending: false })
      .limit(limit)

    return (data ?? []) as Business[]
  },
  ['business-similar-v1'],
  { revalidate: 300, tags: ['businesses'] },
)

// ═══════════════════════════════════════════════════════════
// 4. Sub-categories Map (للعرض في UI)
// ═══════════════════════════════════════════════════════════

export const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
  misc: 'نشاط',
}

export const TIER_LABEL: Record<string, string> = {
  trusted: 'موثوق',
  verified: 'مُوثَّق',
  new: 'جديد',
}
