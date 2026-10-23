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
  business: Pick<
    Business,
    'id' | 'slug' | 'name' | 'area' | 'cover_image_url' | 'business_type' | 'is_open'
  >
}

export type FollowItem = FavoriteItem

export type OrderItem = {
  id: string
  order_code: string
  status: string
  items: string | null
  notes: string | null
  customer_name: string | null
  customer_phone: string | null
  created_at: string
  delivered_at: string | null
  feedback_rating: number | null
  feedback_issue_type: string | null
  feedback_sent_at: string | null
  payment_method: string | null
  delivery_address: string | null
  secondary_phone: string | null
  attachments: unknown[] | null
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
  notification_type: string
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
    supabase
      .from('business_follows')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('order_requests')
      .select('*', { count: 'exact', head: true })
      .eq('customer_profile_id', userId),
    supabase
      .from('points_log')
      .select('balance_after')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null),
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
    .select(
      `
      created_at,
      business:businesses(id, slug, name, area, cover_image_url, business_type, is_open)
    `,
    )
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
    .from('business_follows')
    .select(
      `
      created_at,
      business:businesses(id, slug, name, area, cover_image_url, business_type, is_open)
    `,
    )
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
    .select(
      `
      id, order_code, status, items, notes, customer_name, customer_phone, created_at,
      delivered_at, feedback_rating, feedback_text, feedback_issue_type, feedback_sent_at,
      payment_method, delivery_address, secondary_phone, attachments,
      business:businesses(slug, name, area)
    `,
    )
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
    .select('id, notification_type, title, body, deep_link, read_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []) as NotificationItem[]
}

// ─── Profile (Full) — عبر RPC (SECURITY DEFINER) ───
// السبب: الأعمدة الحساسة (phone, phone_e164, default_address) ممنوعة من SELECT مباشر
// RPC بيتحقق من auth.uid() ويرجّع بيانات صاحب الحساب فقط
export type FullProfile = {
  id: string
  display_name: string
  phone: string | null
  phone_e164: string | null
  phone_verified_at: string | null
  avatar_url: string | null
  bio: string | null
  gender: string | null
  default_area: string | null
  default_address: string | null
  default_latitude: number | null
  default_longitude: number | null
  referral_code: string | null
  trust_score: number
  trust_tier: string
  is_premium: boolean
  premium_until: string | null
  display_name_mode: string
  alias: string | null
  hide_avatar: boolean
  hide_favorites: boolean
  hide_following: boolean
  streak_days: number
  streak_last_date: string | null
  legend_points: number
  created_at: string
}

export async function getFullProfile(_userId: string): Promise<FullProfile | null> {
  void _userId // الـ RPC بيعتمد على auth.uid() — مش محتاج userId
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_my_profile').maybeSingle()
  return (data as FullProfile) ?? null
}
