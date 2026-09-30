import { createClient } from '@/lib/supabase/server'
import type { Business } from './businesses'

// ═══════════════════════════════════════════════════════════
// EAH — Account Data Fetchers
// ═══════════════════════════════════════════════════════════

export type AccountStats = {
  favoritesCount: number
  followsCount: number
  ordersCount: number
  pointsBalance: number
  unreadNotifs: number
}

export type FavoriteItem = {
  id: string
  created_at: string
  business: Pick<Business, 'id' | 'slug' | 'name' | 'area' | 'cover_image_url' | 'business_type' | 'is_open'>
}

export type FollowItem = FavoriteItem

export type OrderItem = {
  id: string
  order_code: string
  status: string
  message: string | null
  created_at: string
  business: { slug: string; name: string; area: string | null } | null
}

export type PointLogItem = {
  id: string
  delta: number
  reason: string
  balance_after: number
  created_at: string
}

export type NotificationItem = {
  id: string
  title: string
  body: string | null
  deep_link: string | null
  read_at: string | null
  created_at: string
}

// ─── Stats ───
export async function getAccountStats(userId: string): Promise<AccountStats> {
  const supabase = await createClient()

  const [
    { count: favoritesCount },
    { count: followsCount },
    { count: ordersCount },
    { data: pointsRow },
    { count: unreadNotifs },
  ] = await Promise.all([
    supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('order_requests').select('*', { count: 'exact', head: true }).eq('customer_profile_id', userId),
    supabase.from('points_log').select('balance_after').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).is('read_at', null),
  ])

  return {
    favoritesCount: favoritesCount ?? 0,
    followsCount: followsCount ?? 0,
    ordersCount: ordersCount ?? 0,
    pointsBalance: pointsRow?.balance_after ?? 0,
    unreadNotifs: unreadNotifs ?? 0,
  }
}

// ─── Favorites ───
export async function getFavorites(userId: string): Promise<FavoriteItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('favorites')
    .select(`
      created_at,
      business:businesses(id, slug, name, area, cover_image_url, business_type, is_open)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!data) return []
  return data
    .filter((r) => r.business)
    .map((r) => ({
      id: (r.business as unknown as FavoriteItem['business']).id,
      created_at: r.created_at,
      business: r.business as unknown as FavoriteItem['business'],
    }))
}

// ─── Following ───
export async function getFollowing(userId: string): Promise<FollowItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follows')
    .select(`
      created_at,
      business:businesses(id, slug, name, area, cover_image_url, business_type, is_open)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!data) return []
  return data
    .filter((r) => r.business)
    .map((r) => ({
      id: (r.business as unknown as FollowItem['business']).id,
      created_at: r.created_at,
      business: r.business as unknown as FollowItem['business'],
    }))
}

// ─── Orders ───
export async function getOrders(userId: string): Promise<OrderItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('order_requests')
    .select(`
      id, order_code, status, message, created_at,
      business:businesses(slug, name, area)
    `)
    .eq('customer_profile_id', userId)
    .order('created_at', { ascending: false })

  if (!data) return []
  return data as unknown as OrderItem[]
}

// ─── Points ───
export async function getPointsLog(userId: string, limit = 50): Promise<PointLogItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('points_log')
    .select('id, delta, reason, balance_after, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []) as PointLogItem[]
}

// ─── Notifications ───
export async function getNotifications(userId: string, limit = 50): Promise<NotificationItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('notifications')
    .select('id, title, body, deep_link, read_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []) as NotificationItem[]
}

// ─── Profile (Full) ───
export type FullProfile = {
  id: string
  display_name: string
  phone: string | null
  gender: string | null
  bio: string | null
  avatar_url: string | null
  trust_score: number
  trust_tier: string
  verified_at: string | null
  phone_verified_at: string | null
  streak_count: number
  referral_code: string | null
  created_at: string
}

export async function getFullProfile(userId: string): Promise<FullProfile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, phone, gender, bio, avatar_url, trust_score, trust_tier, verified_at, phone_verified_at, streak_count, referral_code, created_at')
    .eq('id', userId)
    .maybeSingle()

  return (data as FullProfile) ?? null
}
