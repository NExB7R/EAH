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
  is_published: boolean
  rejection_reason: string | null
  rejected_at: string | null
  owner: { display_name: string; phone: string | null } | null
}

export type BusinessStatus = 'pending' | 'published' | 'rejected' | 'all'

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

export async function getBusinessesByStatus(
  status: BusinessStatus = 'pending',
  limit = 100,
): Promise<PendingBusiness[]> {
  const supabase = await createClient()

  let query = supabase
    .from('businesses')
    .select(
      'id, name, slug, business_type, area, cover_image_url, description, created_at, is_published, rejection_reason, rejected_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status === 'pending') {
    query = query.eq('is_published', false).is('rejected_at', null)
  } else if (status === 'published') {
    query = query.eq('is_published', true)
  } else if (status === 'rejected') {
    query = query.not('rejected_at', 'is', null)
  }

  const { data: businesses } = await query

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

// ═══════════════════════════════════════════════════════════
// Admin — Analytics
// ═══════════════════════════════════════════════════════════

export type AnalyticsSummary = {
  viewsToday: number
  viewsWeek: number
  viewsMonth: number
  uniquesToday: number
  uniquesWeek: number
  uniquesMonth: number
}

export type TopPage = {
  path: string
  count: number
}

export type TopBusiness = {
  id: string
  name: string
  slug: string
  count: number
}

export type ReferrerStat = {
  referrer: string
  count: number
}

export type DeviceStat = {
  device: string
  count: number
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = await createClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: viewsToday },
    { count: viewsWeek },
    { count: viewsMonth },
    { data: todayRaw },
    { data: weekRaw },
    { data: monthRaw },
  ] = await Promise.all([
    supabase
      .from('page_view_events')
      .select('*', { count: 'exact', head: true })
      .gte('occurred_at', todayStart),
    supabase
      .from('page_view_events')
      .select('*', { count: 'exact', head: true })
      .gte('occurred_at', weekStart),
    supabase
      .from('page_view_events')
      .select('*', { count: 'exact', head: true })
      .gte('occurred_at', monthStart),
    supabase
      .from('page_view_events')
      .select('visitor_id')
      .gte('occurred_at', todayStart)
      .limit(5000),
    supabase
      .from('page_view_events')
      .select('visitor_id')
      .gte('occurred_at', weekStart)
      .limit(10000),
    supabase
      .from('page_view_events')
      .select('visitor_id')
      .gte('occurred_at', monthStart)
      .limit(20000),
  ])

  const uniq = (rows: { visitor_id: string }[] | null) =>
    new Set((rows ?? []).map((r) => r.visitor_id)).size

  return {
    viewsToday: viewsToday ?? 0,
    viewsWeek: viewsWeek ?? 0,
    viewsMonth: viewsMonth ?? 0,
    uniquesToday: uniq(todayRaw),
    uniquesWeek: uniq(weekRaw),
    uniquesMonth: uniq(monthRaw),
  }
}

export async function getTopPages(days = 7, limit = 10): Promise<TopPage[]> {
  const supabase = await createClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('page_view_events')
    .select('path')
    .gte('occurred_at', since)
    .limit(10000)

  if (!data) return []

  const counts = new Map<string, number>()
  for (const row of data) {
    counts.set(row.path, (counts.get(row.path) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export async function getTopBusinesses(days = 7, limit = 10): Promise<TopBusiness[]> {
  const supabase = await createClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('page_view_events')
    .select('business_id')
    .gte('occurred_at', since)
    .not('business_id', 'is', null)
    .limit(20000)

  if (!data) return []

  const counts = new Map<string, number>()
  for (const row of data) {
    if (!row.business_id) continue
    counts.set(row.business_id, (counts.get(row.business_id) ?? 0) + 1)
  }

  const topIds = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
  if (topIds.length === 0) return []

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .in(
      'id',
      topIds.map(([id]) => id),
    )

  const bizMap = new Map((businesses ?? []).map((b) => [b.id, b]))

  return topIds
    .map(([id, count]) => {
      const b = bizMap.get(id)
      return b ? { id, name: b.name, slug: b.slug, count } : null
    })
    .filter((x): x is TopBusiness => x !== null)
}

export async function getReferrers(days = 7, limit = 6): Promise<ReferrerStat[]> {
  const supabase = await createClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('page_view_events')
    .select('referrer')
    .gte('occurred_at', since)
    .not('referrer', 'is', null)
    .limit(10000)

  if (!data) return []

  const counts = new Map<string, number>()
  for (const row of data) {
    if (!row.referrer) continue
    let host = 'direct'
    try {
      host = new URL(row.referrer).hostname
    } catch {
      host = row.referrer.slice(0, 40)
    }
    counts.set(host, (counts.get(host) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export async function getDevices(days = 7): Promise<DeviceStat[]> {
  const supabase = await createClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('page_view_events')
    .select('device_type')
    .gte('occurred_at', since)
    .limit(10000)

  if (!data) return []

  const counts = new Map<string, number>()
  for (const row of data) {
    const d = row.device_type ?? 'unknown'
    counts.set(d, (counts.get(d) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count)
}

// ═══════════════════════════════════════════════════════════
// Admin — Reports
// ═══════════════════════════════════════════════════════════

export type ReportRow = {
  id: string
  reporter_profile_id: string
  target_type: string
  target_id: string
  reason: string
  details: string | null
  status: string
  created_at: string
  reporter: { display_name: string } | null
}

export async function getReports(status: string = 'open'): Promise<ReportRow[]> {
  const supabase = await createClient()
  let q = supabase
    .from('reports')
    .select('id, reporter_profile_id, target_type, target_id, reason, details, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status !== 'all') q = q.eq('status', status)

  const { data: reports } = await q
  if (!reports || reports.length === 0) return []

  const reporterIds = [...new Set(reports.map((r) => r.reporter_profile_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', reporterIds)

  const namesMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name]))

  return reports.map((r) => ({
    ...r,
    reporter: { display_name: namesMap.get(r.reporter_profile_id) ?? '—' },
  })) as ReportRow[]
}
