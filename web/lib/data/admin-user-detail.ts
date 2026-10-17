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
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('business_reviews')
      .select('id, rating, comment, status, created_at, business:businesses(name, slug)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
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

  return {
    profile: profile as UserDetail['profile'],
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
