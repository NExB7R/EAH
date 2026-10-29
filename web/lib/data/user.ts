import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — User Session Fetcher (Combined Query)
// ═══════════════════════════════════════════════════════════
// يقلل 4 queries → 1 query + React.cache
// ═══════════════════════════════════════════════════════════

export type AppRole = 'customer' | 'merchant' | 'super_admin'
export type DisplayNameMode = 'real' | 'alias' | 'both' | 'anonymous'

export type UserSession = {
  userId: string
  email: string | null
  displayName: string
  phone: string | null
  avatarUrl: string | null
  role: AppRole
  notifCount: number
  phoneVerified: boolean
  isVerified: boolean
  isPaidMember: boolean
  emailVerified: boolean
  trustScore: number
  trustTier: string
  // الأثر
  streakDays: number
  legendPoints: number
  // Premium
  isPremium: boolean
  premiumUntil: string | null
  // الخصوصية
  displayNameMode: DisplayNameMode
  alias: string | null
  hideAvatar: boolean
  hideFavorites: boolean
  hideFollowing: boolean
}

// ─── اسم العرض حسب الوضع ───
export const getUserSession = cache(async (): Promise<UserSession | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const now = new Date()
  const [
    { data: profile },
    { data: roleRow },
    { count },
    { data: activeAds },
    { data: activeSubscriptions },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'display_name, phone, avatar_url, phone_verified_at, verified_at, trust_score, trust_tier, streak_days, legend_points, is_premium, premium_until, display_name_mode, alias, hide_avatar, hide_favorites, hide_following',
      )
      .eq('id', user.id)
      .maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null)
      .not('notification_type', 'in', '("system","admin","announcement")'),
    supabase
      .from('ads')
      .select('id, starts_at, ends_at, slot:ad_slots(base_price_egp)')
      .eq('owner_profile_id', user.id)
      .eq('status', 'active')
      .limit(20),
    supabase
      .from('business_subscriptions')
      .select('id, is_trial, starts_at, expires_at, plan:subscription_plans(price_egp), business:businesses!inner(owner_profile_id)')
      .eq('status', 'active')
      .eq('is_trial', false)
      .eq('business.owner_profile_id', user.id)
      .limit(20),
  ])

  const isWithinActiveDates = (startsAt: string | null, endsAt: string | null) => {
    const nowMs = now.getTime()
    const startMs = startsAt ? new Date(startsAt).getTime() : Number.NEGATIVE_INFINITY
    const endMs = endsAt ? new Date(endsAt).getTime() : Number.POSITIVE_INFINITY
    return Number.isFinite(startMs) || startsAt === null
      ? startMs <= nowMs && endMs > nowMs
      : false
  }

  const ads = (activeAds ?? []) as unknown as Array<{
    starts_at: string | null
    ends_at: string | null
    slot: { base_price_egp?: string | number | null } | null
  }>
  const subscriptions = (activeSubscriptions ?? []) as unknown as Array<{
    starts_at: string | null
    expires_at: string | null
    plan: { price_egp?: string | number | null } | null
  }>
  const hasPaidAdPackage = ads.some(
    (ad) =>
      isWithinActiveDates(ad.starts_at, ad.ends_at) &&
      Number(ad.slot?.base_price_egp ?? 0) > 0,
  )
  const hasPaidBusinessSubscription = subscriptions.some(
    (subscription) =>
      isWithinActiveDates(subscription.starts_at, subscription.expires_at) &&
      Number(subscription.plan?.price_egp ?? 0) > 0,
  )

  const role = roleRow?.role === 'admin' ? 'customer' : ((roleRow?.role as AppRole) ?? 'customer')
  const premiumUntil = profile?.premium_until ?? null
  const isPremium =
    !!profile?.is_premium &&
    (!premiumUntil || (Number.isFinite(new Date(premiumUntil).getTime()) && new Date(premiumUntil).getTime() > now.getTime()))
  const isVerified = !!profile?.verified_at
  const isPaidMember =
    role !== 'super_admin' && (isPremium || hasPaidAdPackage || hasPaidBusinessSubscription)

  return {
    userId: user.id,
    email: user.email ?? null,
    displayName: profile?.display_name ?? 'مستخدم EAH',
    avatarUrl: profile?.avatar_url ?? null,
    role: roleRow?.role === 'admin' ? 'customer' : ((roleRow?.role as AppRole) ?? 'customer'),
    notifCount: count ?? 0,
    phone: (profile?.phone as string | null) ?? null,
    phoneVerified: !!profile?.phone_verified_at,
    isVerified,
    isPaidMember,
    emailVerified: !!user.email_confirmed_at,
    trustScore: profile?.trust_score ?? 50,
    trustTier: profile?.trust_tier ?? 'fel',
    streakDays: profile?.streak_days ?? 0,
    legendPoints: profile?.legend_points ?? 0,
    isPremium,
    premiumUntil,
    displayNameMode: (profile?.display_name_mode as DisplayNameMode) ?? 'real',
    alias: profile?.alias ?? null,
    hideAvatar: profile?.hide_avatar ?? false,
    hideFavorites: profile?.hide_favorites ?? false,
    hideFollowing: profile?.hide_following ?? false,
  }
})
