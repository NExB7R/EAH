import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Data
// ═══════════════════════════════════════════════════════════

export type AdminStats = {
  totalBusinesses: number
  pendingBusinesses: number
  publishedBusinesses: number
  totalUsers: number
  totalOrders: number
  totalReviews: number
}

export type PendingBusiness = {
  id: string
  name: string
  slug: string
  business_type: string
  area: string | null
  cover_image_url: string | null
  description: string | null
  created_at: string
  owner: { display_name: string; phone: string | null } | null
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient()

  const [
    { count: totalBusinesses },
    { count: pendingBusinesses },
    { count: publishedBusinesses },
    { count: totalUsers },
    { count: totalOrders },
    { count: totalReviews },
  ] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', false),
    supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('order_requests').select('*', { count: 'exact', head: true }),
    supabase.from('business_reviews').select('*', { count: 'exact', head: true }),
  ])

  return {
    totalBusinesses: totalBusinesses ?? 0,
    pendingBusinesses: pendingBusinesses ?? 0,
    publishedBusinesses: publishedBusinesses ?? 0,
    totalUsers: totalUsers ?? 0,
    totalOrders: totalOrders ?? 0,
    totalReviews: totalReviews ?? 0,
  }
}

export async function getPendingBusinesses(limit = 50): Promise<PendingBusiness[]> {
  const supabase = await createClient()

  // 1. الأنشطة المعلقة (بدون owner phone)
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, business_type, area, cover_image_url, description, created_at')
    .eq('is_published', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!businesses || businesses.length === 0) return []

  // 2. أصحاب الأنشطة عبر RPC (يسمح للأدمن يشوف phone)
  const { data: owners } = await supabase.rpc('admin_get_business_owners')

  const ownersMap = new Map<string, { display_name: string; phone: string | null }>()
  for (const o of owners ?? []) {
    ownersMap.set(o.business_id, {
      display_name: o.owner_name,
      phone: o.owner_phone,
    })
  }

  return businesses.map((b) => ({
    ...b,
    owner: ownersMap.get(b.id) ?? null,
  })) as PendingBusiness[]
}

// ═══════════════════════════════════════════════════════════
// Admin — Recent activity (last 24h)
// ═══════════════════════════════════════════════════════════

export type AdminRecent = {
  newBusinesses: number
  newUsers: number
  newOrders: number
  newReviews: number
}

export async function getAdminRecent(): Promise<AdminRecent> {
  const supabase = await createClient()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: newBusinesses },
    { count: newUsers },
    { count: newOrders },
    { count: newReviews },
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', since),
    supabase
      .from('order_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since),
    supabase
      .from('business_reviews')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since),
  ])

  return {
    newBusinesses: newBusinesses ?? 0,
    newUsers: newUsers ?? 0,
    newOrders: newOrders ?? 0,
    newReviews: newReviews ?? 0,
  }
}

// ═══════════════════════════════════════════════════════════
// Admin — Featured Businesses
// ═══════════════════════════════════════════════════════════

export type FeaturedBusiness = {
  id: string
  name: string
  slug: string
  business_type: string
  area: string | null
  cover_image_url: string | null
  is_published: boolean
  is_featured: boolean
  featured_pin: boolean
  featured_order: number
  featured_until: string | null
  created_at: string
}

export async function getFeaturedBusinesses(): Promise<FeaturedBusiness[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('businesses')
    .select(
      'id, name, slug, business_type, area, cover_image_url, is_published, is_featured, featured_pin, featured_order, featured_until, created_at',
    )
    .or('is_featured.eq.true,is_published.eq.true')
    .order('is_featured', { ascending: false })
    .order('featured_pin', { ascending: false })
    .order('featured_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(200)

  return (data ?? []) as FeaturedBusiness[]
}

// ═══════════════════════════════════════════════════════════
// Admin — Audience Targeting
// ═══════════════════════════════════════════════════════════

export type AudienceType = 'all' | 'customers' | 'merchants' | 'verified' | 'premium'

export type AudienceCount = {
  type: AudienceType
  label: string
  count: number
}

export async function getAudienceCounts(): Promise<AudienceCount[]> {
  const supabase = await createClient()

  const [
    { count: all },
    { count: customers },
    { count: merchants },
    { count: verified },
    { count: premium },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'merchant'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('phone_verified_at', 'is', null),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
  ])

  return [
    { type: 'all', label: 'كل المستخدمين', count: all ?? 0 },
    { type: 'customers', label: 'العملاء', count: customers ?? 0 },
    { type: 'merchants', label: 'أصحاب الأنشطة', count: merchants ?? 0 },
    { type: 'verified', label: 'الموثقين', count: verified ?? 0 },
    { type: 'premium', label: 'المميزين', count: premium ?? 0 },
  ]
}

export async function getUserIdsForAudience(type: AudienceType): Promise<string[]> {
  const supabase = await createClient()

  let q = supabase.from('profiles').select('id')
  if (type === 'customers') q = q.eq('role', 'customer')
  if (type === 'merchants') q = q.eq('role', 'merchant')
  if (type === 'verified') q = q.not('phone_verified_at', 'is', null)
  if (type === 'premium') q = q.eq('is_premium', true)

  const { data } = await q
  return (data ?? []).map((r) => r.id)
}

// ═══════════════════════════════════════════════════════════
// Admin — Audit Logs
// ═══════════════════════════════════════════════════════════

export type AuditLog = {
  id: string
  actor_user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  actor: { display_name: string } | null
}

export async function getAuditLogs(limit = 100, action?: string): Promise<AuditLog[]> {
  const supabase = await createClient()
  let q = supabase
    .from('audit_logs')
    .select('id, actor_user_id, action, entity_type, entity_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (action) q = q.eq('action', action)

  const { data: logs } = await q
  if (!logs || logs.length === 0) return []

  // جيب أسماء الأدمن
  const userIds = [...new Set(logs.map((l) => l.actor_user_id).filter(Boolean))] as string[]
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('id, display_name').in('id', userIds)
    : { data: [] }

  const namesMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name]))

  return logs.map((l) => ({
    ...l,
    metadata: (l.metadata ?? {}) as Record<string, unknown>,
    actor: l.actor_user_id ? { display_name: namesMap.get(l.actor_user_id) ?? '—' } : null,
  })) as AuditLog[]
}
