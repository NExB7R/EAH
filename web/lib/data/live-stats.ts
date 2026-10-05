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
  weather: {
    temp: number
    code: number
    label: string
    icon: string
  } | null
}

export const getLiveStats = unstable_cache(
  async (): Promise<Omit<LiveStats, 'weather'>> => {
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
        .select('*', { count: 'exact', head: true })
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
      supabase.from('business_reviews').select('rating').eq('status', 'approved').limit(5000),
      supabase.from('businesses').select('area').eq('is_published', true).not('area', 'is', null),
      supabase
        .from('page_view_events')
        .select('visitor_id')
        .gte('occurred_at', monthIso)
        .limit(30000),
    ])

    const ratings = (reviewsData ?? [])
      .map((r) => (r as { rating: number | null }).rating)
      .filter((r): r is number => typeof r === 'number' && r > 0)
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

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

// ─── الطقس — Open-Meteo (مجاني، بدون API key) ───

const WEATHER_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: 'صافي', icon: '☀️' },
  1: { label: 'صافي أغلب الوقت', icon: '🌤️' },
  2: { label: 'غائم جزئياً', icon: '⛅' },
  3: { label: 'غائم', icon: '☁️' },
  45: { label: 'ضباب', icon: '🌫️' },
  48: { label: 'ضباب متجمد', icon: '🌫️' },
  51: { label: 'رش خفيف', icon: '🌦️' },
  53: { label: 'رش', icon: '🌦️' },
  55: { label: 'رش غزير', icon: '🌧️' },
  61: { label: 'مطر خفيف', icon: '🌧️' },
  63: { label: 'مطر', icon: '🌧️' },
  65: { label: 'مطر غزير', icon: '🌧️' },
  71: { label: 'ثلج خفيف', icon: '🌨️' },
  73: { label: 'ثلج', icon: '🌨️' },
  75: { label: 'ثلج غزير', icon: '❄️' },
  80: { label: 'زخات مطر', icon: '🌦️' },
  81: { label: 'زخات غزيرة', icon: '🌧️' },
  82: { label: 'زخات عنيفة', icon: '⛈️' },
  95: { label: 'رعد', icon: '⛈️' },
  96: { label: 'رعد + برد', icon: '⛈️' },
  99: { label: 'رعد شديد', icon: '⛈️' },
}

const SHIBIN_LAT = 30.5541
const SHIBIN_LNG = 31.0092

export const getWeather = unstable_cache(
  async (): Promise<LiveStats['weather']> => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${SHIBIN_LAT}&longitude=${SHIBIN_LNG}&current=temperature_2m,weather_code`
      const res = await fetch(url, {
        next: { revalidate: 1800 },
      })
      if (!res.ok) return null

      const data = (await res.json()) as {
        current?: { temperature_2m?: number; weather_code?: number }
      }

      const temp = data.current?.temperature_2m
      const code = data.current?.weather_code

      if (typeof temp !== 'number' || typeof code !== 'number') return null

      const meta = WEATHER_CODES[code] ?? { label: 'غير معروف', icon: '🌡️' }

      return {
        temp: Math.round(temp),
        code,
        label: meta.label,
        icon: meta.icon,
      }
    } catch {
      return null
    }
  },
  ['weather-shibin'],
  { revalidate: 1800, tags: ['weather'] },
)

export async function getAllLiveStats(): Promise<LiveStats> {
  const [stats, weather] = await Promise.all([getLiveStats(), getWeather()])
  return { ...stats, weather }
}
