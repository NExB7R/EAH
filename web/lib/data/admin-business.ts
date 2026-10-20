import { createServiceClient } from '@/lib/supabase/service'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Detail (Service Role — bypass RLS)
// ═══════════════════════════════════════════════════════════

export type AdminBusiness = {
  id: string
  slug: string
  name: string
  owner_profile_id: string
  business_type: string
  description: string | null
  hook: string | null
  area: string | null
  city: string | null
  address_text: string | null
  map_url: string | null
  location: { lat: number; lng: number } | null
  cover_image_url: string | null
  is_published: boolean
  is_open: boolean
  is_featured: boolean
  trust_score: number
  trust_tier: string
  successful_orders: number
  rating_avg: number
  rating_count: number
  rejection_reason: string | null
  rejected_at: string | null
  created_at: string
  updated_at: string
  source: 'merchant' | 'admin'
  trial_used: boolean
  claimed_at: string | null
  claimed_by_user_id: string | null
  open_now_override: boolean | null
  important_notice: string | null
  notice_expires_at: string | null
  notice_severity: 'info' | 'warning' | 'critical'
  owner: { id: string; display_name: string; phone: string | null } | null
  contacts: { method_type: string; value: string; is_primary: boolean }[]
  branches: { id: string; name: string; area: string | null; address_text: string | null }[]
  media: { id: string; media_type: string; storage_path: string }[]
}

export async function getBusinessById(id: string): Promise<AdminBusiness | null> {
  const supabase = createServiceClient()

  const { data: biz } = await supabase.from('businesses').select('*').eq('id', id).maybeSingle()

  if (!biz) return null

  const b = biz as Record<string, unknown>

  const [ownerRes, contactsRes, branchesRes, mediaRes, locationRes] = await Promise.all([
    b.owner_profile_id
      ? supabase
          .from('profiles')
          .select('id, display_name, phone')
          .eq('id', b.owner_profile_id as string)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('business_contact_methods')
      .select('method_type, value, is_primary')
      .eq('business_id', id),
    supabase
      .from('business_branches')
      .select('id, name, area, address_text')
      .eq('business_id', id)
      .eq('is_active', true)
      .order('is_primary', { ascending: false }),
    supabase
      .from('business_media')
      .select('id, media_type, storage_path')
      .eq('business_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('business_locations')
      .select('latitude, longitude, is_primary')
      .eq('business_id', id)
      .order('is_primary', { ascending: false })
      .limit(1),
  ])

  return {
    id: b.id as string,
    slug: b.slug as string,
    name: b.name as string,
    owner_profile_id: b.owner_profile_id as string,
    business_type: b.business_type as string,
    description: (b.description as string | null) ?? null,
    hook: (b.hook as string | null) ?? null,
    area: (b.area as string | null) ?? null,
    city: (b.city as string | null) ?? null,
    address_text: (b.address_text as string | null) ?? null,
    map_url: (b.map_url as string | null) ?? null,
    cover_image_url: (b.cover_image_url as string | null) ?? null,
    is_published: !!b.is_published,
    is_open: !!b.is_open,
    is_featured: !!b.is_featured,
    trust_score: (b.trust_score as number) ?? 50,
    trust_tier: (b.trust_tier as string) ?? 'fel',
    successful_orders: (b.successful_orders as number) ?? 0,
    rating_avg: (b.rating_avg as number) ?? 0,
    rating_count: (b.rating_count as number) ?? 0,
    rejection_reason: (b.rejection_reason as string | null) ?? null,
    source: ((b.source as string) ?? 'merchant') as 'merchant' | 'admin',
    trial_used: (b.trial_used as boolean) ?? false,
    claimed_at: (b.claimed_at as string | null) ?? null,
    open_now_override: (b.open_now_override as boolean | null) ?? null,
    important_notice: (b.important_notice as string | null) ?? null,
    notice_expires_at: (b.notice_expires_at as string | null) ?? null,
    notice_severity: ((b.notice_severity as string) ?? 'info') as 'info' | 'warning' | 'critical',
    claimed_by_user_id: (b.claimed_by_user_id as string | null) ?? null,
    rejected_at: (b.rejected_at as string | null) ?? null,
    created_at: b.created_at as string,
    updated_at: b.updated_at as string,
    owner: ownerRes.data
      ? {
          id: ownerRes.data.id,
          display_name: ownerRes.data.display_name,
          phone: ownerRes.data.phone,
        }
      : null,
    contacts: (contactsRes.data ?? []) as AdminBusiness['contacts'],
    branches: (branchesRes.data ?? []) as AdminBusiness['branches'],
    media: (mediaRes.data ?? []) as AdminBusiness['media'],
    location: (() => {
      const loc = (locationRes.data ?? [])[0] as { latitude: number; longitude: number } | undefined
      if (loc && Number.isFinite(loc.latitude) && Number.isFinite(loc.longitude)) {
        return { lat: loc.latitude, lng: loc.longitude }
      }
      return null
    })(),
  }
}

// ─── قائمة أصحاب الأنشطة (لإنشاء نشاط جديد) ───

export type BusinessOwnerOption = {
  id: string
  display_name: string
  phone: string | null
}

export async function getBusinessOwnerCandidates(): Promise<BusinessOwnerOption[]> {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('user_roles')
    .select('user_id, role, profiles:user_id(id, display_name, phone)')
    .eq('role', 'merchant')

  type Row = {
    user_id: string
    profiles: { id: string; display_name: string; phone: string | null } | null
  }
  const rows = (data ?? []) as unknown as Row[]

  return rows
    .filter((r) => r.profiles)
    .map((r) => ({
      id: r.user_id,
      display_name: r.profiles!.display_name,
      phone: r.profiles!.phone,
    }))
}
