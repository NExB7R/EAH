import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import UsersList from './users-list'
import ExportButton from '@/components/ui/export-button'
import type { AdminUser, UserFilter } from './types'
import styles from './users.module.css'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ filter?: string; q?: string }>
}

const TABS: { key: UserFilter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'customers', label: 'المشترين' },
  { key: 'merchants', label: 'البياعين' },
  { key: 'admins', label: 'الأدمن' },
  { key: 'premium', label: 'مميز' },
  { key: 'banned', label: 'محظورين' },
]

async function getUsers(filter: UserFilter, q: string): Promise<AdminUser[]> {
  const supabase = await createClient()

  // 1) profiles عبر RPC (للأدمن)
  const { data: profiles } = await supabase.rpc('admin_get_profiles')
  if (!profiles) return []

  // 2) الأدوار
  const { data: roles } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in(
      'user_id',
      profiles.map((p: { id: string }) => p.id),
    )

  const rolesMap = new Map<string, string>()
  for (const r of roles ?? []) {
    rolesMap.set(r.user_id as string, r.role as string)
  }

  // 3) بناء القائمة
  let users: AdminUser[] = profiles.map((p: Record<string, unknown>) => ({
    id: p.id as string,
    display_name: (p.display_name as string) ?? '—',
    avatar_url: p.avatar_url as string | null,
    phone: p.phone as string | null,
    phone_verified_at: p.phone_verified_at as string | null,
    trust_score: (p.trust_score as number) ?? 0,
    trust_tier: (p.trust_tier as string) ?? 'fel',
    created_at: p.created_at as string,
    role: rolesMap.get(p.id as string) ?? null,
    banned_until: (p.banned_until as string | null) ?? null,
    ban_reason: (p.ban_reason as string | null) ?? null,
    is_premium: (p.is_premium as boolean) ?? false,
    premium_until: null,
    is_paid_member: false,
    verified_at: null,
  }))

  // 4) فلترة
  const now = new Date()

  if (filter === 'customers') users = users.filter((u) => !u.role || u.role === 'customer')
  else if (filter === 'merchants') users = users.filter((u) => u.role === 'merchant')
  else if (filter === 'admins')
    users = users.filter((u) => u.role === 'super_admin')
  else if (filter === 'premium') users = users.filter((u) => u.is_premium)
  else if (filter === 'banned')
    users = users.filter((u) => u.banned_until && new Date(u.banned_until) > now)

  // 5) بحث
  const query = q.trim().toLowerCase()
  if (query) {
    users = users.filter(
      (u) => u.display_name.toLowerCase().includes(query) || (u.phone ?? '').includes(query),
    )
  }

  // Enrich only the visible page with verification and paid-membership state.
  // The admin RPC intentionally returns a smaller projection, so verified_at and
  // premium_until are fetched separately only for the IDs shown on this page.
  const visibleUsers = users.slice(0, 200)
  const userIds = visibleUsers.map((user) => user.id)
  if (userIds.length === 0) return []

  const [{ data: badgeProfiles }, { data: activeAds }, { data: ownedBusinesses }] =
    await Promise.all([
      supabase.from('profiles').select('id, verified_at, premium_until').in('id', userIds),
      supabase
        .from('ads')
        .select('owner_profile_id, starts_at, ends_at, slot:ad_slots(base_price_egp)')
        .in('owner_profile_id', userIds)
        .eq('status', 'active')
        .limit(1000),
      supabase.from('businesses').select('id, owner_profile_id').in('owner_profile_id', userIds).limit(500),
    ])

  const badgeProfileMap = new Map(
    (badgeProfiles ?? []).map((profile) => [
      profile.id as string,
      {
        verified_at: profile.verified_at as string | null,
        premium_until: profile.premium_until as string | null,
      },
    ]),
  )
  const businessOwners = new Map(
    (ownedBusinesses ?? []).map((business) => [business.id as string, business.owner_profile_id as string]),
  )
  const businessIds = Array.from(businessOwners.keys())
  const { data: activeSubscriptions } = businessIds.length
    ? await supabase
        .from('business_subscriptions')
        .select('business_id, starts_at, expires_at, plan:subscription_plans(price_egp)')
        .in('business_id', businessIds)
        .eq('status', 'active')
        .eq('is_trial', false)
        .limit(1000)
    : { data: [] }

  const nowMs = Date.now()
  const isActiveRange = (startsAt: string | null, endsAt: string | null) => {
    const startMs = startsAt ? new Date(startsAt).getTime() : Number.NEGATIVE_INFINITY
    const endMs = endsAt ? new Date(endsAt).getTime() : Number.POSITIVE_INFINITY
    return (
      (startsAt === null || Number.isFinite(startMs)) &&
      (endsAt === null || Number.isFinite(endMs)) &&
      startMs <= nowMs &&
      endMs > nowMs
    )
  }
  const paidUserIds = new Set(
    visibleUsers
      .filter((user) => {
        const premiumUntil = badgeProfileMap.get(user.id)?.premium_until
        return (
          user.is_premium &&
          (!premiumUntil ||
            (Number.isFinite(new Date(premiumUntil).getTime()) &&
              new Date(premiumUntil).getTime() > nowMs))
        )
      })
      .map((user) => user.id),
  )

  const ads = (activeAds ?? []) as unknown as Array<{
    owner_profile_id: string
    starts_at: string | null
    ends_at: string | null
    slot: { base_price_egp?: string | number | null } | null
  }>
  for (const ad of ads) {
    if (isActiveRange(ad.starts_at, ad.ends_at) && Number(ad.slot?.base_price_egp ?? 0) > 0) {
      paidUserIds.add(ad.owner_profile_id)
    }
  }

  const subscriptions = (activeSubscriptions ?? []) as unknown as Array<{
    business_id: string
    starts_at: string | null
    expires_at: string | null
    plan: { price_egp?: string | number | null } | null
  }>
  for (const subscription of subscriptions) {
    if (isActiveRange(subscription.starts_at, subscription.expires_at) &&
        Number(subscription.plan?.price_egp ?? 0) > 0) {
      const ownerId = businessOwners.get(subscription.business_id)
      if (ownerId) paidUserIds.add(ownerId)
    }
  }

  return visibleUsers.map((user) => {
    const profile = badgeProfileMap.get(user.id)
    return {
      ...user,
      verified_at: profile?.verified_at ?? null,
      premium_until: profile?.premium_until ?? null,
      is_paid_member: paidUserIds.has(user.id),
    }
  })
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams
  const filter = (params.filter as UserFilter) ?? 'all'
  const q = params.q ?? ''
  const validFilter = TABS.some((t) => t.key === filter) ? filter : 'all'

  const users = await getUsers(validFilter, q)

  return (
    <div>
      <AccountPageHeader title="المستخدمين" description={`${users.length} مستخدم`} />

      {/* Tabs */}
      <nav className={styles.tabs} aria-label="تصفية المستخدمين">
        {TABS.map((tab) => {
          const active = tab.key === validFilter
          return (
            <Link
              key={tab.key}
              href={`/admin/users?filter=${tab.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {/* Search */}
      <form action="/admin/users" method="get" className={styles.searchForm}>
        <input type="hidden" name="filter" value={validFilter} />
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="ابحث بالاسم أو الرقم..."
          className={styles.searchInput}
          dir="rtl"
        />
        {q && (
          <Link href={`/admin/users?filter=${validFilter}`} className={styles.clearBtn}>
            مسح
          </Link>
        )}
      </form>

      {users.length === 0 ? (
        <EmptyState
          Icon={UserIcon}
          title={q ? 'مفيش نتائج' : 'مفيش مستخدمين'}
          description={q ? `مفيش حد اسمه أو رقمه فيه "${q}"` : 'لسه محدش سجل'}
        />
      ) : (
        <>
          <div className={styles.topBar}>
            <ExportButton type="users" />
          </div>
          <UsersList users={users} filter={validFilter} />
        </>
      )}

      {users.length >= 200 && (
        <p className={styles.limitHint}>بيظهر أول 200 فقط — استخدم البحث أو الفلتر للتضييق</p>
      )}
    </div>
  )
}
