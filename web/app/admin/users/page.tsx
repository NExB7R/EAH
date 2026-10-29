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
  { key: 'customers', label: 'المشترون' },
  { key: 'merchants', label: 'البايعون' },
  { key: 'admins', label: 'الأدمن الأعلى' },
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
    verified_at: (p.verified_at as string | null) ?? null,
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

  // 6) limit
  return users.slice(0, 200)
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
