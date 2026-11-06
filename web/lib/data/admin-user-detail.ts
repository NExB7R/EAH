import { createClient } from '@/lib/supabase/server'

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
    standing: string | null
    standing_reason: string | null
    standing_expires_at: string | null
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
      'id, display_name, avatar_url, phone, phone_verified_at, trust_score, trust_tier, created_at, banned_until, ban_reason, is_premium, premium_until, verified_at, bio, standing, standing_reason, standing_expires_at',
    )
    .eq('id', userId)
    .maybeSingle()

  if (!profile) return null

  const [rolesRes, auditRes, bizRes, reviewsRes] = await Promise.all([
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
  ])

  return {
    profile: profile as any,
    role: rolesRes.data?.role ?? 'customer',
    auditLogs: auditRes.data ?? [],
    businesses: bizRes.data ?? [],
    reviews: (reviewsRes.data ?? []).map((r: any) => ({
      ...r,
      business_name: r.business?.name ?? null,
      business_slug: r.business?.slug ?? null,
    })),
  }
}

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


export type ViolationStats = {
  total: number
  weighted: number
  nextThreshold: { at: number; level: string } | null
}

export async function getViolationStats(userId: string): Promise<ViolationStats> {
  const supabase = await createClient()
  const since = new Date(); since.setDate(since.getDate() - 30)
  const { data } = await supabase
    .from("trust_events")
    .select("event_type")
    .eq("entity_id", userId)
    .in("event_type", ["review_rejected", "report_valid"])
    .gte("created_at", since.toISOString())
  const events = (data || []) as { event_type: string }[]
  const weighted = events.reduce((s, e) => s + (e.event_type === "report_valid" ? 2 : 1), 0)
  let next: ViolationStats["nextThreshold"] = null
  if (weighted < 3) next = { at: 3, level: "تحذير" }
  else if (weighted < 6) next = { at: 6, level: "تقييد" }
  else if (weighted < 10) next = { at: 10, level: "حظر" }
  return { total: events.length, weighted, nextThreshold: next }
}
