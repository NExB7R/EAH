import { unstable_cache } from 'next/cache'
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
  custom_business_type?: string | null
  area: string | null
  cover_image_url: string | null
  description: string | null
  created_at: string
  is_published: boolean
  rejection_reason: string | null
  rejected_at: string | null
  business_type_status: 'pending' | 'approved' | 'rejected' | null
  source: 'merchant' | 'admin'
  trial_used: boolean
  owner: { display_name: string; phone: string | null } | null
}

export type BusinessStatus = 'pending' | 'published' | 'rejected' | 'admin_owned' | 'all'

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
      .eq('is_published', false)
      .is('rejected_at', null),
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
      'id, name, slug, business_type, custom_business_type, area, cover_image_url, description, created_at, is_published, rejection_reason, rejected_at, business_type_status, source, trial_used',
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status === 'pending') {
    query = query.eq('is_published', false).is('rejected_at', null)
  } else if (status === 'published') {
    query = query.eq('is_published', true)
  } else if (status === 'rejected') {
    query = query.not('rejected_at', 'is', null)
  } else if (status === 'admin_owned') {
    query = query.eq('source', 'admin')
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
    supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'merchant'),
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

  if (type === 'customers' || type === 'merchants') {
    const role = type === 'customers' ? 'customer' : 'merchant'
    const { data } = await supabase.from('user_roles').select('user_id').eq('role', role)
    return (data ?? []).map((r) => r.user_id as string)
  }

  let q = supabase.from('profiles').select('id')
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
  reporter_id: string
  entity_type: string
  entity_id: string | null
  reason: string
  note: string | null
  status: string
  admin_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  reporter: { display_name: string } | null
}

export async function getReports(status: string = 'open'): Promise<ReportRow[]> {
  const supabase = await createClient()
  let q = supabase
    .from('reports')
    .select('id, reporter_id, entity_type, entity_id, reason, note, status, admin_note, reviewed_by, reviewed_at, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status === 'open') q = q.in('status', ['pending', 'reviewing'])
  else if (status !== 'all') q = q.eq('status', status)

  const { data: reports } = await q
  if (!reports || reports.length === 0) return []

  const reporterIds = [...new Set(reports.map((r) => r.reporter_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', reporterIds)

  const namesMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name]))

  return reports.map((r) => ({
    ...r,
    reporter: { display_name: namesMap.get(r.reporter_id) ?? '—' },
  })) as ReportRow[]
}

// ═══════════════════════════════════════════════════════════
// Admin — Badges (counts للـ sidebar + dashboard)
// ═══════════════════════════════════════════════════════════

export type AdminBadges = {
  pendingBusinesses: number
  flaggedReviews: number
  openReports: number
  pendingSubscriptions: number
}

export const getAdminBadges = unstable_cache(
  async (): Promise<AdminBadges> => {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const supabase = createServiceClient()
    const [
      { count: pendingBusinesses },
      { count: flaggedReviews },
      { count: openReports },
      { count: pendingSubscriptions },
    ] = await Promise.all([
      supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', false)
        .is('rejected_at', null),
      supabase
        .from('business_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase
        .from('business_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ])
    return {
      pendingBusinesses: pendingBusinesses ?? 0,
      flaggedReviews: flaggedReviews ?? 0,
      openReports: openReports ?? 0,
      pendingSubscriptions: pendingSubscriptions ?? 0,
    }
  },
  ['admin-badges'],
  { revalidate: 30, tags: ['admin-badges'] },
)

// ═══════════════════════════════════════════════════════════
// Admin — Daily Views (للـ chart)
// ═══════════════════════════════════════════════════════════

export type DailyView = {
  date: string // YYYY-MM-DD
  count: number
  uniques: number
}

export async function getDailyViews(days: number = 30): Promise<DailyView[]> {
  const supabase = await createClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('page_view_events')
    .select('occurred_at, visitor_id')
    .gte('occurred_at', since)
    .limit(50000)

  // تجميع حسب اليوم
  const byDay = new Map<string, { count: number; visitors: Set<string> }>()
  for (const row of data ?? []) {
    const day = row.occurred_at.slice(0, 10)
    let entry = byDay.get(day)
    if (!entry) {
      entry = { count: 0, visitors: new Set() }
      byDay.set(day, entry)
    }
    entry.count += 1
    entry.visitors.add(row.visitor_id)
  }

  // نبني المصفوفة كاملة (نملأ الفجوات بصفر)
  const result: DailyView[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    const entry = byDay.get(key)
    result.push({
      date: key,
      count: entry?.count ?? 0,
      uniques: entry?.visitors.size ?? 0,
    })
  }
  return result
}

// ═══════════════════════════════════════════════════════════
// Admin — Period Delta (مقارنة بالفترة السابقة)
// ═══════════════════════════════════════════════════════════

export type PeriodDelta = {
  viewsCurrent: number
  viewsPrev: number
  uniquesCurrent: number
  uniquesPrev: number
  deltaPct: number
  uniquesDeltaPct: number
}

export async function getPeriodDelta(days: number = 7): Promise<PeriodDelta> {
  const supabase = await createClient()
  const now = Date.now()
  const currentStart = new Date(now - days * 24 * 60 * 60 * 1000).toISOString()
  const prevStart = new Date(now - 2 * days * 24 * 60 * 60 * 1000).toISOString()

  const [{ count: viewsCurrent }, { count: viewsPrev }, { data: currentRaw }, { data: prevRaw }] =
    await Promise.all([
      supabase
        .from('page_view_events')
        .select('*', { count: 'exact', head: true })
        .gte('occurred_at', currentStart),
      supabase
        .from('page_view_events')
        .select('*', { count: 'exact', head: true })
        .gte('occurred_at', prevStart)
        .lt('occurred_at', currentStart),
      supabase
        .from('page_view_events')
        .select('visitor_id')
        .gte('occurred_at', currentStart)
        .limit(20000),
      supabase
        .from('page_view_events')
        .select('visitor_id')
        .gte('occurred_at', prevStart)
        .lt('occurred_at', currentStart)
        .limit(20000),
    ])

  const uniq = (rows: { visitor_id: string }[] | null) =>
    new Set((rows ?? []).map((r) => r.visitor_id)).size

  const c = viewsCurrent ?? 0
  const p = viewsPrev ?? 0
  const uc = uniq(currentRaw)
  const up = uniq(prevRaw)

  const deltaPct = p === 0 ? (c > 0 ? 100 : 0) : Math.round(((c - p) / p) * 100)
  const uniquesDeltaPct = up === 0 ? (uc > 0 ? 100 : 0) : Math.round(((uc - up) / up) * 100)

  return {
    viewsCurrent: c,
    viewsPrev: p,
    uniquesCurrent: uc,
    uniquesPrev: up,
    deltaPct,
    uniquesDeltaPct,
  }
}

// ═══════════════════════════════════════════════════════════
// Admin — Audit Stats
// ═══════════════════════════════════════════════════════════

export type AuditStats = {
  total: number
  today: number
  thisWeek: number
  uniqueActions: number
  uniqueActors: number
}

export async function getAuditStats(): Promise<AuditStats> {
  const supabase = await createClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ count: total }, { count: today }, { count: thisWeek }, { data: uniqueData }] =
    await Promise.all([
      supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
      supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart),
      supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekStart),
      supabase
        .from('audit_logs')
        .select('action, actor_user_id')
        .gte('created_at', weekStart)
        .limit(2000),
    ])

  const actionsSet = new Set<string>()
  const actorsSet = new Set<string>()
  for (const row of uniqueData ?? []) {
    actionsSet.add(row.action)
    if (row.actor_user_id) actorsSet.add(row.actor_user_id)
  }

  return {
    total: total ?? 0,
    today: today ?? 0,
    thisWeek: thisWeek ?? 0,
    uniqueActions: actionsSet.size,
    uniqueActors: actorsSet.size,
  }
}
