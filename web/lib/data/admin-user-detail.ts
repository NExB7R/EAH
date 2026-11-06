import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — Admin User Detail data
// ═══════════════════════════════════════════════════════════

export type UserDetail = {
  profile: {
    id: string
    display_name: string
    avatar_url: string | null
    phone: string | null
    phone_verified_at: string | null
    trust_score: number
    trust_tier: string | null
    created_at: string
    banned_until: string | null
    ban_reason: string | null
    is_premium: boolean
    premium_until: string | null
    verified_at: string | null
    is_paid_member: boolean
    bio: string | null
  }
  role: string
  auditLogs: { id: string; action: string; created_at: string; entity_type: string | null }[]
  businesses: {
    id: string
    name: string
    slug: string
    is_published: boolean
    created_at: string
  }[]
  reviews: {
    id: string
    rating: number
    comment: string | null
    status: string
    created_at: string
    business_name: string | null
    business_slug: string | null
  }[]
}

export async function getAdminUserDetail(userId: string): Promise<UserDetail | null> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'id, display_name, avatar_url, phone, phone_verified_at, trust_score, trust_tier, created_at, banned_until, ban_reason, is_premium, premium_until, verified_at, bio',
    )
    .eq('id', userId)
    .maybeSingle()

  if (!profile) return null

  const [rolesRes, auditRes, bizRes, reviewsRes, adsRes] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
    supabase
      .from('audit_logs')
      .select('id, action, created_at, entity_type')
      .eq('actor_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('businesses')
      .select('id, name, slug, is_published, created_at')
      .eq('owner_profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('business_reviews')
      .select('id, rating, comment, status, created_at, business:businesses(name, slug)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('ads')
      .select('starts_at, ends_at, slot:ad_slots(base_price_egp)')
      .eq('owner_profile_id', userId)
      .eq('status', 'active')
      .limit(50),
  ])

  const reviews = (reviewsRes.data ?? []).map((r) => {
    const biz = r.business as unknown as { name: string; slug: string } | null
    return {
      id: r.id as string,
      rating: r.rating as number,
      comment: r.comment as string | null,
      status: r.status as string,
      created_at: r.created_at as string,
      business_name: biz?.name ?? null,
      business_slug: biz?.slug ?? null,
    }
  })

  const businessIds = (bizRes.data ?? []).map((business) => business.id)
  const { data: subscriptionsData } = businessIds.length
    ? await supabase
        .from('business_subscriptions')
        .select('starts_at, expires_at, plan:subscription_plans(price_egp)')
        .in('business_id', businessIds)
        .eq('status', 'active')
        .eq('is_trial', false)
        .limit(100)
    : { data: [] }

  const nowMs = Date.now()
  const isWithinActiveDates = (startsAt: string | null, endsAt: string | null) => {
    const startMs = startsAt ? new Date(startsAt).getTime() : Number.NEGATIVE_INFINITY
    const endMs = endsAt ? new Date(endsAt).getTime() : Number.POSITIVE_INFINITY
    return (
      (startsAt === null || Number.isFinite(startMs)) &&
      (endsAt === null || Number.isFinite(endMs)) &&
      startMs <= nowMs &&
      endMs > nowMs
    )
  }

  const activeAds = (adsRes.data ?? []) as unknown as Array<{
    starts_at: string | null
    ends_at: string | null
    slot: { base_price_egp?: string | number | null } | null
  }>
  const hasActivePaidAd = activeAds.some(
    (ad) =>
      isWithinActiveDates(ad.starts_at, ad.ends_at) && Number(ad.slot?.base_price_egp ?? 0) > 0,
  )

  const activeSubscriptions = (subscriptionsData ?? []) as unknown as Array<{
    starts_at: string | null
    expires_at: string | null
    plan: { price_egp?: string | number | null } | null
  }>
  const hasActivePaidBusinessSubscription = activeSubscriptions.some(
    (subscription) =>
      isWithinActiveDates(subscription.starts_at, subscription.expires_at) &&
      Number(subscription.plan?.price_egp ?? 0) > 0,
  )

  const premiumUntil = profile.premium_until as string | null
  const hasActivePremium =
    !!profile.is_premium &&
    (!premiumUntil ||
      (Number.isFinite(new Date(premiumUntil).getTime()) &&
        new Date(premiumUntil).getTime() > nowMs))
  const isPaidMember = hasActivePremium || hasActivePaidAd || hasActivePaidBusinessSubscription

  return {
    profile: { ...profile, is_paid_member: isPaidMember } as UserDetail['profile'],
    role: (rolesRes.data?.role as string) ?? 'customer',
    auditLogs: (auditRes.data ?? []).map((l) => ({
      id: l.id as string,
      action: l.action as string,
      created_at: l.created_at as string,
      entity_type: l.entity_type as string | null,
    })),
    businesses: (bizRes.data ?? []).map((b) => ({
      id: b.id as string,
      name: b.name as string,
      slug: b.slug as string,
      is_published: b.is_published as boolean,
      created_at: b.created_at as string,
    })),
    reviews,
  }
}

// ═══════════════════════════════════════════════════════════
// Standing Audit Trail (History)
// ═══════════════════════════════════════════════════════════
export type StandingEvent = {
  id: string
  action: string
  previous_standing: string | null
  new_standing: string | null
  reason: string | null
  expires_at: string | null
  created_at: string
  admin_name: string | null
}

export async function getStandingEvents(userId: string): Promise<StandingEvent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('standing_events')
    .select(`
      id, action, previous_standing, new_standing, reason, expires_at, created_at,
      admin:admin_id(display_name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch standing events:', error)
    return []
  }

  return (data || []).map((e: any) => ({
    ...e,
    admin_name: e.admin?.display_name || 'الإدارة'
  }))
}
