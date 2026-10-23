import { requireAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/service'
import type { BusinessStatus, PendingBusiness } from '@/lib/data/admin'

const BUSINESS_LIST_COLUMNS =
  'id, name, slug, business_type, custom_business_type, area, cover_image_url, description, created_at, is_published, rejection_reason, rejected_at, business_type_status, source, trial_used, owner_profile_id'

const PAGE_SIZE = 25
const MAX_OWNER_MATCHES_PER_SEARCH = 250

export type AdminBusinessCounts = {
  all: number
  pending: number
  published: number
  rejected: number
  adminOwned: number
}

export type AdminBusinessesPage = {
  businesses: PendingBusiness[]
  counts: AdminBusinessCounts
  total: number
  page: number
  pageSize: number
  ownerSearchLimited: boolean
}

export type AdminBusinessesPageParams = {
  status: BusinessStatus
  query?: string
  area?: string
  page?: number
}

function normalizeQuery(value: string): string {
  return value.trim().toLocaleLowerCase().slice(0, 100)
}

function safeTextFilter(value: string): string {
  return value
    .replace(/[,*()_%'"]/g, ' ')
    .replace(/\\/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function makeSearchFilter(value: string): string {
  const pattern = '%' + value + '%'
  return 'name.ilike.' + pattern + ',area.ilike.' + pattern
}

function makeOwnerSearchFilter(value: string): string {
  const pattern = '%' + value + '%'
  return 'display_name.ilike.' + pattern + ',phone.ilike.' + pattern
}

export async function getAdminBusinessesPage({
  status,
  query = '',
  area = '',
  page = 1,
}: AdminBusinessesPageParams): Promise<AdminBusinessesPage> {
  const context = await requireAdmin()
  if (!context.ok) throw new Error(context.error)

  // This function has passed an explicit admin authorization check. The
  // service client is used narrowly for owner profile data because profile
  // phone fields are not generally readable through the user session client.
  const supabase = context.supabase
  const service = createServiceClient()
  const normalizedQuery = normalizeQuery(query)
  const safeQuery = safeTextFilter(normalizedQuery)
  const requestedPage = Number.isSafeInteger(page) && page > 0 ? Math.min(page, 10_000) : 1
  const offset = (requestedPage - 1) * PAGE_SIZE

  const countByStatus = async (target: BusinessStatus) => {
    let countQuery = supabase.from('businesses').select('id', { count: 'exact', head: true })

    if (target === 'pending') {
      countQuery = countQuery.eq('is_published', false).is('rejected_at', null)
    } else if (target === 'published') {
      countQuery = countQuery.eq('is_published', true)
    } else if (target === 'rejected') {
      countQuery = countQuery.not('rejected_at', 'is', null)
    } else if (target === 'admin_owned') {
      // Source-only dimension: admin-created, regardless of publish state.
      // Publishing state is a separate axis ('منشور' / 'بانتظار').
      countQuery = countQuery.eq('source', 'admin')
    }

    const { count, error } = await countQuery
    if (error) throw new Error('تعذر تحميل أعداد الأنشطة من قاعدة البيانات')
    return count ?? 0
  }

  const [allCount, pendingCount, publishedCount, rejectedCount, adminOwnedCount] =
    await Promise.all([
      countByStatus('all'),
      countByStatus('pending'),
      countByStatus('published'),
      countByStatus('rejected'),
      countByStatus('admin_owned'),
    ])

  const counts: AdminBusinessCounts = {
    all: allCount,
    pending: pendingCount,
    published: publishedCount,
    rejected: rejectedCount,
    adminOwned: adminOwnedCount,
  }

  const buildScopedQuery = () => {
    let scopedQuery = supabase
      .from('businesses')
      .select(BUSINESS_LIST_COLUMNS, { count: 'exact' })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })

    if (status === 'pending') {
      scopedQuery = scopedQuery.eq('is_published', false).is('rejected_at', null)
    } else if (status === 'published') {
      scopedQuery = scopedQuery.eq('is_published', true)
    } else if (status === 'rejected') {
      scopedQuery = scopedQuery.not('rejected_at', 'is', null)
    } else if (status === 'admin_owned') {
      scopedQuery = scopedQuery.eq('source', 'admin')
    }

    if (area) scopedQuery = scopedQuery.eq('area', area)
    return scopedQuery
  }

  let ownerSearchLimited = normalizedQuery.length > 0 && !safeQuery
  const ownerProfiles = new Map<string, { display_name: string; phone: string | null }>()

  let total = 0
  let rows: Record<string, unknown>[] = []

  if (!normalizedQuery) {
    const { data, count, error } = await buildScopedQuery().range(offset, offset + PAGE_SIZE - 1)
    if (error) throw new Error('تعذر تحميل قائمة الأنشطة')
    total = count ?? 0
    rows = (data ?? []) as unknown as Record<string, unknown>[]
  } else {
    const textFilter = safeQuery ? makeSearchFilter(safeQuery) : ''
    const matchingOwnerProfileIds: string[] = []

    if (safeQuery) {
      const { data, count, error } = await service
        .from('profiles')
        .select('id, display_name, phone', { count: 'exact' })
        .or(makeOwnerSearchFilter(safeQuery))
        .order('id', { ascending: true })
        .limit(MAX_OWNER_MATCHES_PER_SEARCH + 1)

      if (error) {
        ownerSearchLimited = true
      } else if (
        (count ?? 0) > MAX_OWNER_MATCHES_PER_SEARCH ||
        (data?.length ?? 0) > MAX_OWNER_MATCHES_PER_SEARCH
      ) {
        ownerSearchLimited = true
      } else {
        for (const profile of data ?? []) {
          matchingOwnerProfileIds.push(profile.id)
          ownerProfiles.set(profile.id, {
            display_name: profile.display_name,
            phone: profile.phone,
          })
        }
      }
    }

    // Build one database-level OR so text and owner matches share the same
    // stable order, exact count, and page window. This avoids fetching every
    // match into server memory or silently truncating searches past 1,000 rows.
    const filterParts = [
      ...(textFilter ? [textFilter] : []),
      ...(matchingOwnerProfileIds.length > 0
        ? ['owner_profile_id.in.(' + matchingOwnerProfileIds.join(',') + ')']
        : []),
    ]

    if (filterParts.length > 0) {
      const { data, count, error } = await buildScopedQuery()
        .or(filterParts.join(','))
        .range(offset, offset + PAGE_SIZE - 1)

      if (error) throw new Error('تعذر البحث في الأنشطة')
      total = count ?? 0
      rows = (data ?? []) as unknown as Record<string, unknown>[]
    }
  }

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (requestedPage > lastPage) {
    return getAdminBusinessesPage({ status, query, area, page: lastPage })
  }

  // Load contact details only for owner profiles represented on the visible
  // page. This avoids transferring every owner record to the server on each
  // admin-list request, while keeping phone data out of client-facing columns.
  const pageOwnerIds = [
    ...new Set(
      rows
        .map((row) => row.owner_profile_id)
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ),
  ]
  const missingOwnerIds = pageOwnerIds.filter((id) => !ownerProfiles.has(id))

  if (missingOwnerIds.length > 0) {
    const { data, error } = await service
      .from('profiles')
      .select('id, display_name, phone')
      .in('id', missingOwnerIds)

    if (error) throw new Error('تعذر تحميل بيانات أصحاب الأنشطة')
    for (const profile of data ?? []) {
      ownerProfiles.set(profile.id, {
        display_name: profile.display_name,
        phone: profile.phone,
      })
    }
  }

  const businesses = rows.map((row) => {
    const ownerProfileId = typeof row.owner_profile_id === 'string' ? row.owner_profile_id : null
    const business: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      if (key === 'owner_profile_id') continue
      business[key] = value
    }
    return {
      ...business,
      owner: ownerProfileId ? (ownerProfiles.get(ownerProfileId) ?? null) : null,
    }
  }) as unknown as PendingBusiness[]

  return {
    businesses,
    counts,
    total,
    page: requestedPage,
    pageSize: PAGE_SIZE,
    ownerSearchLimited,
  }
}
