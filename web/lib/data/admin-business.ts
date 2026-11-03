import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth/admin'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Detail (Service Role — bypass RLS)
// ═══════════════════════════════════════════════════════════

export type AdminBusiness = {
  id: string
  slug: string
  name: string
  owner_profile_id: string | null
  business_type: string
  custom_business_type: string | null
  business_type_status: 'pending' | 'approved' | 'rejected' | null
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
  is_verified: boolean
  accepts_whatsapp_orders: boolean
  featured_order: number
  featured_pin: boolean
  featured_until: string | null
  is_new_project: boolean
  new_until: string | null
  verified_at: string | null
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
  contacts: { method_type: string; value: string; is_primary: boolean; sort_order?: number | null }[]
  branches: {
    id: string
    name: string
    area: string | null
    address_text: string | null
    latitude: number | null
    longitude: number | null
    phone: string | null
    whatsapp: string | null
    is_primary: boolean
    is_active: boolean
    sort_order: number
  }[]
  media: { id: string; media_type: string; storage_path: string }[]
  offers: {
    id: string
    title: string
    description: string | null
    price: number | null
    image_url: string | null
    teaser_image_url: string | null
    starts_at: string | null
    ends_at: string | null
    is_published: boolean
    created_at: string
  }[]
}

export async function getBusinessById(id: string): Promise<AdminBusiness | null> {
  // Protect the service-role query at the data boundary; a parent layout is
  // not sufficient because Server Components may be evaluated independently.
  const access = await requireAdmin()
  if (!access.ok) return null

  const supabase = createServiceClient()

  // B2 exception (ERROR_REGISTER §6): 32+ columns required across
  // form/hooks (incl. working_hours cast in business-form-hooks.ts).
  // Retaining select('*') to prevent breakage when new columns are added.
  const { data: biz } = await supabase.from('businesses').select('*').eq('id', id).maybeSingle()

  if (!biz) return null

  const b = biz as Record<string, unknown>

  const [ownerRes, contactsRes, branchesRes, mediaRes, locationRes, offersRes] = await Promise.all([
    b.owner_profile_id
      ? supabase
          .from('profiles')
          .select('id, display_name, phone')
          .eq('id', b.owner_profile_id as string)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('business_contact_methods')
      .select('method_type, value, is_primary, sort_order')
      .eq('business_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('business_branches')
      .select(
        'id, name, area, address_text, latitude, longitude, phone, whatsapp, is_primary, is_active, sort_order',
      )
      .eq('business_id', id)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true }),
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
    supabase
      .from('offers')
      .select(
        'id, title, description, price, image_url, teaser_image_url, starts_at, ends_at, is_published, created_at',
      )
      .eq('business_id', id)
      .order('created_at', { ascending: false }),
  ])

  return {
    id: b.id as string,
    slug: b.slug as string,
    name: b.name as string,
    owner_profile_id: (b.owner_profile_id as string | null) ?? null,
    business_type: b.business_type as string,
    custom_business_type: (b.custom_business_type as string | null) ?? null,
    business_type_status: (b.business_type_status as AdminBusiness['business_type_status']) ?? null,
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
    is_verified: !!b.is_verified,
    accepts_whatsapp_orders: !!b.accepts_whatsapp_orders,
    featured_order: Number(b.featured_order ?? 0),
    featured_pin: !!b.featured_pin,
    featured_until: (b.featured_until as string | null) ?? null,
    is_new_project: !!b.is_new_project,
    new_until: (b.new_until as string | null) ?? null,
    verified_at: (b.verified_at as string | null) ?? null,
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
    offers: (offersRes.data ?? []) as AdminBusiness['offers'],
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
  role: 'customer' | 'merchant'
}

export async function getBusinessOwnerCandidates(): Promise<BusinessOwnerOption[]> {
  // This query returns profile names and phone numbers; authorize immediately
  // before constructing the service-role client.
  const access = await requireAdmin()
  if (!access.ok) return []

  const supabase = createServiceClient()

  // user_roles.user_id references auth.users, not profiles directly. Avoid a
  // PostgREST embedded join here: the schema cache has no user_roles -> profiles
  // relationship, which caused the owner picker to silently render an empty list.
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('role', ['customer', 'merchant'])
    .order('role', { ascending: true })

  if (roleError) {
    console.error('[admin-business] failed to load owner roles:', roleError.message)
    return []
  }

  type RoleRow = { user_id: string; role: 'customer' | 'merchant' }
  const roleRows = (roleData ?? []) as RoleRow[]
  const userIds = [...new Set(roleRows.map((row) => row.user_id).filter(Boolean))]
  if (userIds.length === 0) return []

  // The merchant workspace and merchant application currently support one
  // linked business per account. Do not offer accounts that already own one.
  const { data: linkedOwners, error: linkedOwnersError } = await supabase
    .from('businesses')
    .select('owner_profile_id')
    .in('owner_profile_id', userIds)

  if (linkedOwnersError) {
    console.error('[admin-business] failed to check existing business links:', linkedOwnersError.message)
    return []
  }

  const linkedOwnerIds = new Set(
    (linkedOwners ?? [])
      .map((business) => business.owner_profile_id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0),
  )
  const availableRoleRows = roleRows.filter((row) => !linkedOwnerIds.has(row.user_id))
  const availableUserIds = [...new Set(availableRoleRows.map((row) => row.user_id))]
  if (availableUserIds.length === 0) return []

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, phone')
    .in('id', availableUserIds)

  if (profileError) {
    console.error('[admin-business] failed to load owner profiles:', profileError.message)
    return []
  }

  const profilesById = new Map((profileData ?? []).map((profile) => [profile.id, profile]))

  return availableRoleRows.flatMap((row) => {
    const profile = profilesById.get(row.user_id)
    return profile
      ? [
          {
            id: row.user_id,
            display_name: profile.display_name,
            phone: profile.phone,
            role: row.role,
          },
        ]
      : []
  })
}
