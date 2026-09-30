import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — Business Insights (AI Analysis Data Layer)
// ═══════════════════════════════════════════════════════════

export type BusinessMetrics = {
  // الفترة
  periodStart: string
  periodEnd: string
  days: number

  // الزيارات
  pageViews: number
  uniqueVisitors: number
  viewsByDay: Array<{ date: string; count: number }>

  // الطلبات
  ordersTotal: number
  ordersConfirmed: number
  ordersCancelled: number
  ordersPending: number
  avgResponseTimeMin: number | null
  ordersByDay: Array<{ date: string; count: number }>

  // التعليقات والتقييمات
  reviewsTotal: number
  reviewsPositive: number
  reviewsNeutral: number
  reviewsNegative: number
  avgRating: number
  ratingDistribution: Record<string, number>
  comments: Array<{
    rating: number
    comment: string | null
    sentiment: string | null
    created_at: string
  }>

  // التفاعل
  favoritesCount: number
  followsCount: number

  // معلومات أساسية
  trustScore: number
  trustTier: string
  isVerified: boolean
  hasWhatsapp: boolean
  hasPhone: boolean
  hasMenu: boolean
  mediaCount: number
}

// ═══════════════════════════════════════════════════════════
// Main: Get Business Metrics
// ═══════════════════════════════════════════════════════════

export async function getBusinessMetrics(businessId: string, days = 30): Promise<BusinessMetrics> {
  const supabase = await createClient()

  const periodEnd = new Date()
  const periodStart = new Date(periodEnd.getTime() - days * 24 * 60 * 60 * 1000)

  const since = periodStart.toISOString()

  // ─── Parallel fetch ───
  const [
    { data: business },
    { data: pageViews },
    { data: orders },
    { data: reviews },
    { count: favoritesCount },
    { count: followsCount },
    { count: mediaCount },
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select(
        'trust_score, trust_tier, accepts_whatsapp_orders, offers_count, rating_avg, rating_count',
      )
      .eq('id', businessId)
      .single(),

    supabase
      .from('page_view_events')
      .select('visitor_id, created_at')
      .eq('business_id', businessId)
      .gte('created_at', since),

    supabase
      .from('order_requests')
      .select('status, response_time_avg_seconds, created_at')
      .eq('business_id', businessId)
      .gte('created_at', since),

    supabase
      .from('business_reviews')
      .select('rating: experience, comment, sentiment, created_at')
      .eq('business_id', businessId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(200),

    supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId),

    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId),

    supabase
      .from('business_media')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('is_published', true),
  ])

  // ─── Process views ───
  const viewsByDayMap: Record<string, number> = {}
  const uniqueVisitorIds = new Set<string>()
  for (const v of pageViews ?? []) {
    const day = v.created_at.slice(0, 10)
    viewsByDayMap[day] = (viewsByDayMap[day] ?? 0) + 1
    if (v.visitor_id) uniqueVisitorIds.add(v.visitor_id)
  }
  const viewsByDay = Object.entries(viewsByDayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // ─── Process orders ───
  let confirmed = 0,
    cancelled = 0,
    pending = 0
  const responseTimes: number[] = []
  const ordersByDayMap: Record<string, number> = {}

  for (const o of orders ?? []) {
    const day = o.created_at.slice(0, 10)
    ordersByDayMap[day] = (ordersByDayMap[day] ?? 0) + 1

    if (o.status === 'delivered' || o.status === 'confirmed') confirmed++
    else if (o.status === 'cancelled') cancelled++
    else pending++

    if (o.response_time_avg_seconds) {
      responseTimes.push(o.response_time_avg_seconds)
    }
  }

  const ordersByDay = Object.entries(ordersByDayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const avgResponseTimeMin =
    responseTimes.length > 0
      ? Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 60) * 10) / 10
      : null

  // ─── Process reviews ───
  let positive = 0,
    neutral = 0,
    negative = 0
  const ratingDist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  const comments: BusinessMetrics['comments'] = []

  for (const r of reviews ?? []) {
    const rating = (r.rating as number) ?? 0
    if (rating > 0 && rating <= 5) {
      ratingDist[String(rating)] = (ratingDist[String(rating)] ?? 0) + 1
    }

    if (rating >= 4) positive++
    else if (rating === 3) neutral++
    else if (rating > 0) negative++

    if (r.comment) {
      comments.push({
        rating,
        comment: r.comment,
        sentiment: r.sentiment,
        created_at: r.created_at,
      })
    }
  }

  const reviewsTotal = reviews?.length ?? 0
  const avgRating =
    reviewsTotal > 0
      ? Math.round(
          ((reviews ?? []).reduce((sum, r) => sum + ((r.rating as number) ?? 0), 0) /
            reviewsTotal) *
            10,
        ) / 10
      : 0

  // ─── Media count ───
  const mediaTotal = mediaCount ?? 0

  return {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    days,

    pageViews: pageViews?.length ?? 0,
    uniqueVisitors: uniqueVisitorIds.size,
    viewsByDay,

    ordersTotal: orders?.length ?? 0,
    ordersConfirmed: confirmed,
    ordersCancelled: cancelled,
    ordersPending: pending,
    avgResponseTimeMin,
    ordersByDay,

    reviewsTotal,
    reviewsPositive: positive,
    reviewsNeutral: neutral,
    reviewsNegative: negative,
    avgRating,
    ratingDistribution: ratingDist,
    comments,

    favoritesCount: favoritesCount ?? 0,
    followsCount: followsCount ?? 0,

    trustScore: business?.trust_score ?? 50,
    trustTier: business?.trust_tier ?? 'new',
    isVerified: business?.trust_tier === 'verified' || business?.trust_tier === 'trusted',
    hasWhatsapp: business?.accepts_whatsapp_orders ?? false,
    hasPhone: true, // placeholder
    hasMenu: mediaTotal > 0,
    mediaCount: mediaTotal,
  }
}

// ═══════════════════════════════════════════════════════════
// Comparison: متوسط نفس التصنيف
// ═══════════════════════════════════════════════════════════

export type ComparisonData = {
  avgRating: number
  avgPageViews: number
  avgOrders: number
  totalInCategory: number
}

export async function getCategoryComparison(businessId: string): Promise<ComparisonData | null> {
  const supabase = await createClient()

  const { data: biz } = await supabase
    .from('businesses')
    .select('business_type, area')
    .eq('id', businessId)
    .single()

  if (!biz) return null

  const { data: peers } = await supabase
    .from('businesses')
    .select('id, rating_avg, rating_count')
    .eq('business_type', biz.business_type)
    .eq('is_published', true)
    .neq('id', businessId)

  if (!peers || peers.length === 0) {
    return {
      avgRating: 0,
      avgPageViews: 0,
      avgOrders: 0,
      totalInCategory: 0,
    }
  }

  const ratingsWithCount = peers.filter((p) => p.rating_count > 0)
  const avgRating =
    ratingsWithCount.length > 0
      ? Math.round(
          (ratingsWithCount.reduce((s, p) => s + Number(p.rating_avg), 0) /
            ratingsWithCount.length) *
            10,
        ) / 10
      : 0

  return {
    avgRating,
    avgPageViews: 0, // ممكن نحسبها لاحقاً
    avgOrders: 0,
    totalInCategory: peers.length,
  }
}

// ═══════════════════════════════════════════════════════════
// Insights: Save / Retrieve
// ═══════════════════════════════════════════════════════════

export type StoredInsight = {
  id: string
  business_id: string
  period_start: string
  period_end: string
  data: BusinessMetrics
  score: number | null
  summary: string | null
  top_points: unknown
  recommendations: unknown
  comparison: ComparisonData | null
  created_at: string
}

export async function getLatestInsight(businessId: string): Promise<StoredInsight | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_insights')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (data as StoredInsight) ?? null
}

export async function getAllInsights(businessId: string, limit = 12): Promise<StoredInsight[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_insights')
    .select('id, period_start, period_end, score, summary, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []) as unknown as StoredInsight[]
}
