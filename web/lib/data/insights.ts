import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — Business Insights (AI Analysis Data Layer)
// 2026: dimensions JSONB + Peak Hours + Week-over-Week
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
  dimensionAverages: Record<string, number>
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
  isVerified: boolean
  hasWhatsapp: boolean
  hasPhone: boolean
  hasMenu: boolean
  mediaCount: number

  // ✨ New — Peak Hours
  peakHour: number | null
  peakDay: string | null
  hourHistogram: number[] // 24 values (0-23)
  dayHistogram: Record<string, number> // sun..sat

  // ✨ New — Week-over-Week
  prevPeriod: {
    pageViews: number
    ordersTotal: number
    reviewsTotal: number
    avgRating: number
  }
}

// ─── Helper: حساب متوسط التقييم من dimensions JSONB ───
function avgFromDimensions(dims: Record<string, number> | null): number {
  if (!dims) return 0
  const vals = Object.values(dims).filter((v) => typeof v === 'number' && v >= 1 && v <= 5)
  if (vals.length === 0) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

// Cairo offset (UTC+2, DST مفعّل صيفاً — بنستخدم +2 كتقريب آمن)
function cairoHour(iso: string): number {
  const d = new Date(iso)
  const hour = d.getUTCHours() + 2
  return hour >= 24 ? hour - 24 : hour
}

function cairoDayKey(iso: string): string {
  const d = new Date(iso)
  return DAY_KEYS[d.getUTCDay()] ?? 'sun'
}

// ═══════════════════════════════════════════════════════════
// Main: Get Business Metrics
// ═══════════════════════════════════════════════════════════

export async function getBusinessMetrics(businessId: string, days = 30): Promise<BusinessMetrics> {
  const supabase = await createClient()

  const periodEnd = new Date()
  const periodStart = new Date(periodEnd.getTime() - days * 24 * 60 * 60 * 1000)
  const prevStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000)

  const since = periodStart.toISOString()
  const prevSince = prevStart.toISOString()

  // ─── Parallel fetch ───
  const [
    { data: business },
    { data: pageViews },
    { data: prevPageViewsRaw },
    { data: orders },
    { data: prevOrdersRaw },
    { data: reviews },
    { data: prevReviewsRaw },
    { count: favoritesCount },
    { count: followsCount },
    { count: mediaCount },
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select(
        'is_verified, accepts_whatsapp_orders, offers_count, rating_avg, rating_count',
      )
      .eq('id', businessId)
      .single(),

    supabase
      .from('page_view_events')
      .select('visitor_id, created_at')
      .eq('business_id', businessId)
      .gte('created_at', since),

    supabase
      .from('page_view_events')
      .select('created_at', { count: 'exact', head: false })
      .eq('business_id', businessId)
      .gte('created_at', prevSince)
      .lt('created_at', since),

    supabase
      .from('order_requests')
      .select('status, response_time_avg_seconds, created_at')
      .eq('business_id', businessId)
      .gte('created_at', since),

    supabase
      .from('order_requests')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', prevSince)
      .lt('created_at', since),

    supabase
      .from('business_reviews')
      .select('dimensions, comment, sentiment, created_at')
      .eq('business_id', businessId)
      .eq('status', 'approved')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(200),

    supabase
      .from('business_reviews')
      .select('dimensions')
      .eq('business_id', businessId)
      .eq('status', 'approved')
      .gte('created_at', prevSince)
      .lt('created_at', since),

    supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId),

    supabase
      .from('business_follows')
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
  const hourHistogram = new Array(24).fill(0) as number[]
  const dayHistogram: Record<string, number> = {
    sun: 0,
    mon: 0,
    tue: 0,
    wed: 0,
    thu: 0,
    fri: 0,
    sat: 0,
  }

  for (const v of pageViews ?? []) {
    const day = v.created_at.slice(0, 10)
    viewsByDayMap[day] = (viewsByDayMap[day] ?? 0) + 1
    if (v.visitor_id) uniqueVisitorIds.add(v.visitor_id)
    hourHistogram[cairoHour(v.created_at)]! += 1
    dayHistogram[cairoDayKey(v.created_at)]! += 1
  }

  const viewsByDay = Object.entries(viewsByDayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // ─── Peak ───
  let peakHour: number | null = null
  let peakHourVal = 0
  hourHistogram.forEach((c, h) => {
    if (c > peakHourVal) {
      peakHourVal = c
      peakHour = h
    }
  })
  if (peakHourVal === 0) peakHour = null

  let peakDay: string | null = null
  let peakDayVal = 0
  for (const [k, v] of Object.entries(dayHistogram)) {
    if (v > peakDayVal) {
      peakDayVal = v
      peakDay = k
    }
  }
  if (peakDayVal === 0) peakDay = null

  // ─── Process orders ───
  let confirmed = 0
  let cancelled = 0
  let pending = 0
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

  // ─── Process reviews (JSONB) ───
  let positive = 0
  let neutral = 0
  let negative = 0
  const ratingDist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  const dimSum: Record<string, number> = {}
  const dimCount: Record<string, number> = {}
  const comments: BusinessMetrics['comments'] = []

  let ratingSum = 0
  let ratingCount = 0

  for (const r of reviews ?? []) {
    const dims = (r.dimensions ?? null) as Record<string, number> | null
    const rating = Math.round(avgFromDimensions(dims))
    if (rating > 0 && rating <= 5)
      ratingDist[String(rating)] = (ratingDist[String(rating)] ?? 0) + 1

    if (rating > 0) {
      ratingSum += avgFromDimensions(dims)
      ratingCount++
      if (rating >= 4) positive++
      else if (rating === 3) neutral++
      else negative++
    }

    if (dims) {
      for (const [key, v] of Object.entries(dims)) {
        if (typeof v === 'number' && v >= 1 && v <= 5) {
          dimSum[key] = (dimSum[key] ?? 0) + v
          dimCount[key] = (dimCount[key] ?? 0) + 1
        }
      }
    }

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
  const avgRating = ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0

  const dimensionAverages: Record<string, number> = {}
  for (const key of Object.keys(dimSum)) {
    const s = dimSum[key] ?? 0
    const c = dimCount[key] ?? 0
    if (c > 0) dimensionAverages[key] = Math.round((s / c) * 10) / 10
  }

  // ─── Prev period ───
  const prevPageViews = prevPageViewsRaw?.length ?? 0
  const prevOrdersTotal = prevOrdersRaw?.length ?? 0
  const prevReviewsTotal = prevReviewsRaw?.length ?? 0
  let prevRatingSum = 0
  let prevRatingCount = 0
  for (const r of prevReviewsRaw ?? []) {
    const v = avgFromDimensions((r.dimensions ?? null) as Record<string, number> | null)
    if (v > 0) {
      prevRatingSum += v
      prevRatingCount++
    }
  }
  const prevAvgRating =
    prevRatingCount > 0 ? Math.round((prevRatingSum / prevRatingCount) * 10) / 10 : 0

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
    dimensionAverages,
    comments,

    favoritesCount: favoritesCount ?? 0,
    followsCount: followsCount ?? 0,

    isVerified: business?.is_verified === true,
    hasWhatsapp: business?.accepts_whatsapp_orders ?? false,
    hasPhone: true,
    hasMenu: mediaTotal > 0,
    mediaCount: mediaTotal,

    peakHour,
    peakDay,
    hourHistogram,
    dayHistogram,

    prevPeriod: {
      pageViews: prevPageViews,
      ordersTotal: prevOrdersTotal,
      reviewsTotal: prevReviewsTotal,
      avgRating: prevAvgRating,
    },
  }
}

// ═══════════════════════════════════════════════════════════
// Comparison
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
    return { avgRating: 0, avgPageViews: 0, avgOrders: 0, totalInCategory: 0 }
  }

  const withRating = peers.filter((p) => p.rating_count > 0)
  const avgRating =
    withRating.length > 0
      ? Math.round(
          (withRating.reduce((s, p) => s + Number(p.rating_avg), 0) / withRating.length) * 10,
        ) / 10
      : 0

  return {
    avgRating,
    avgPageViews: 0,
    avgOrders: 0,
    totalInCategory: peers.length,
  }
}

// ═══════════════════════════════════════════════════════════
// Stored Insights
// ═══════════════════════════════════════════════════════════

export type StoredInsight = {
  id: string
  business_id: string
  period_start: string
  period_end: string
  data: BusinessMetrics
  score: number | null
  summary: string | null
  ai_narrative: string | null
  top_points: unknown
  recommendations: unknown
  comparison: ComparisonData | null
  created_at: string
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

// ═══════════════════════════════════════════════════════════
// Admin: list ALL insights across businesses
// ═══════════════════════════════════════════════════════════

export type AdminInsightRow = {
  id: string
  business_id: string
  business_name: string
  business_slug: string
  period_start: string
  period_end: string
  score: number | null
  summary: string | null
  generated_by: string | null
  created_at: string
}

export async function getAllInsightsForAdmin(limit = 100): Promise<AdminInsightRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_insights')
    .select(
      'id, business_id, period_start, period_end, score, summary, generated_by, created_at, business:businesses(name, slug)',
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!data) return []

  return data.map((r) => {
    const biz = r.business as unknown as { name: string; slug: string } | null
    return {
      id: r.id,
      business_id: r.business_id,
      business_name: biz?.name ?? '—',
      business_slug: biz?.slug ?? '',
      period_start: r.period_start,
      period_end: r.period_end,
      score: r.score,
      summary: r.summary,
      generated_by: r.generated_by,
      created_at: r.created_at ?? new Date().toISOString(),
    }
  })
}
