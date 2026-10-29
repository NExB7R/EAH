import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'

// ═══════════════════════════════════════════════════════════
// EAH — Live Stats (Footer counters)
//   • 8 عدادات — Cache 5 دقايق + الطقس 30 دقيقة
// ═══════════════════════════════════════════════════════════

export type LiveStats = {
  activeBusinesses: number
  totalUsers: number
  totalReviews: number
  avgRating: number
  totalOrders: number
  todayVisits: number
  monthlyUsers: number
  areasServed: number
}

export const getLiveStats = unstable_cache(
  async (): Promise<LiveStats> => {
    const supabase = createPublicClient()

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayIso = todayStart.toISOString()

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthIso = monthStart.toISOString()

    const [
      { count: activeBusinesses },
      { count: totalUsers },
      { count: totalReviews },
      { count: totalOrders },
      { count: todayVisits },
      { data: reviewsData },
      { data: areasData },
      { data: monthVisitors },
    ] = await Promise.all([
      supabase
        .from('businesses')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('business_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved'),
      supabase.from('order_requests').select('*', { count: 'exact', head: true }),
      supabase
        .from('page_view_events')
        .select('*', { count: 'exact', head: true })
        .gte('occurred_at', todayIso),
      supabase.from('business_reviews').select('dimensions').eq('status', 'approved').limit(5000),
      supabase.from('businesses').select('area').eq('is_published', true).not('area', 'is', null),
      supabase
        .from('page_view_events')
        .select('visitor_id')
        .gte('occurred_at', monthIso)
        .limit(30000),
    ])

    // Reviews 2.0: dimensions JSONB — { taste: 5, speed: 4, ... }
    type ReviewRow = { dimensions: Record<string, number> | null }
    const allScores: number[] = []
    for (const r of (reviewsData ?? []) as ReviewRow[]) {
      const dims = r.dimensions ?? {}
      const vals = Object.values(dims).filter((v) => typeof v === 'number' && v > 0 && v <= 5)
      if (vals.length > 0) {
        allScores.push(vals.reduce((a, b) => a + b, 0) / vals.length)
      }
    }
    const avgRating =
      allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0

    const monthlyUsersSet = new Set(
      (monthVisitors ?? [])
        .map((r) => (r as { visitor_id: string | null }).visitor_id)
        .filter((v): v is string => !!v),
    )

    const uniqueAreas = new Set(
      (areasData ?? [])
        .map((a) => (a as { area: string | null }).area)
        .filter((a): a is string => !!a),
    )

    return {
      activeBusinesses: activeBusinesses ?? 0,
      totalUsers: totalUsers ?? 0,
      totalReviews: totalReviews ?? 0,
      avgRating: Math.round(avgRating * 10) / 10,
      totalOrders: totalOrders ?? 0,
      todayVisits: todayVisits ?? 0,
      monthlyUsers: monthlyUsersSet.size,
      areasServed: uniqueAreas.size,
    }
  },
  ['live-stats'],
  { revalidate: 300, tags: ['live-stats'] },
)

export async function getAllLiveStats(): Promise<LiveStats> {
  return getLiveStats()
}
