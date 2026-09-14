import { createClient } from '@/lib/supabase-server'

export type BusinessStats = {
  business_id: string
  avg_taste: number
  avg_value: number
  avg_speed: number
  avg_experience: number
  avg_rating: number
  total_reviews: number
  review_count: number
  active_offers: number
  recent_views: number
}

export type ReviewItem = {
  id: string
  taste: number
  value_for_money: number
  speed: number
  experience: number
  comment: string | null
  created_at: string
  user_name: string | null
}

const FALLBACK_STATS = (businessId: string): BusinessStats => ({
  business_id: businessId,
  avg_taste: 0,
  avg_value: 0,
  avg_speed: 0,
  avg_experience: 0,
  avg_rating: 0,
  total_reviews: 0,
  review_count: 0,
  active_offers: 0,
  recent_views: 0,
})

export async function getBusinessStats(businessId: string): Promise<BusinessStats> {
  try {
    const supabase = await createClient()

    const { data: reviews } = await supabase
      .from('business_reviews')
      .select('taste,value_for_money,speed,experience')
      .eq('business_id', businessId)
      .eq('status', 'approved')

    const { count: activeOffers } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('is_published', true)

    if (!reviews || reviews.length === 0) {
      return { ...FALLBACK_STATS(businessId), active_offers: activeOffers ?? 0 }
    }

    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)
    const n = reviews.length

    const avg_taste = sum(reviews.map((r) => r.taste)) / n
    const avg_value = sum(reviews.map((r) => r.value_for_money)) / n
    const avg_speed = sum(reviews.map((r) => r.speed)) / n
    const avg_experience = sum(reviews.map((r) => r.experience)) / n
    const avg_rating = (avg_taste + avg_value + avg_speed + avg_experience) / 4

    return {
      business_id: businessId,
      avg_taste,
      avg_value,
      avg_speed,
      avg_experience,
      avg_rating,
      total_reviews: n,
      review_count: n,
      active_offers: activeOffers ?? 0,
      recent_views: 0,
    }
  } catch {
    return FALLBACK_STATS(businessId)
  }
}

export async function getBusinessReviews(businessId: string, limit = 6): Promise<ReviewItem[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('business_reviews')
      .select('id,taste,value_for_money,speed,experience,comment,created_at,user_id')
      .eq('business_id', businessId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!data) return []

    const userIds = [...new Set(data.map((r) => r.user_id).filter(Boolean))]
    let profilesMap: Record<string, string> = {}

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id,display_name')
        .in('id', userIds)

      profilesMap = (profiles ?? []).reduce((acc, p) => {
        acc[p.id] = p.display_name ?? 'زائر'
        return acc
      }, {} as Record<string, string>)
    }

    return data.map((r) => ({
      id: r.id,
      taste: r.taste,
      value_for_money: r.value_for_money,
      speed: r.speed,
      experience: r.experience,
      comment: r.comment,
      created_at: r.created_at,
      user_name: profilesMap[r.user_id] ?? null,
    }))
  } catch {
    return []
  }
}

export async function getBusinessOffers(businessId: string) {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('offers')
      .select('id,title,description,price,teaser_image_path,starts_at,ends_at')
      .eq('business_id', businessId)
      .eq('is_published', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order('created_at', { ascending: false })

    return data ?? []
  } catch {
    return []
  }
}

export async function getBusinessContacts(businessId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('business_contact_methods')
      .select('method_type,value,is_primary')
      .eq('business_id', businessId)
      .eq('is_public', true)

    return data ?? []
  } catch {
    return []
  }
}
