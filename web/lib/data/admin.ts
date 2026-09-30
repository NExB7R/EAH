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
