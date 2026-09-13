import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import UserActions from '@/components/admin/user-actions'
import './users.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'المستخدمين' }

type Profile = {
  id: string
  display_name: string | null
  phone: string | null
  phone_verified_at: string | null
  trust_score: number | null
  banned_until: string | null
  ban_reason: string | null
  created_at: string
  user_roles: { role: string } | { role: string }[] | null
}

function getRole(p: Profile): string {
  if (!p.user_roles) return 'customer'
  if (Array.isArray(p.user_roles)) return p.user_roles[0]?.role ?? 'customer'
  return p.user_roles.role ?? 'customer'
}

const ROLE_LABEL: Record<string, string> = {
  customer: 'عميل',
  merchant: 'تاجر',
  admin: 'أدمن',
  super_admin: 'سوبر أدمن',
}

const ROLE_EMOJI: Record<string, string> = {
  customer: '👤',
  merchant: '🏪',
  admin: '🛡️',
  super_admin: '👑',
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; banned?: string; q?: string }>
}) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (roleRow?.role !== 'super_admin' && roleRow?.role !== 'admin') redirect('/')

  const params = await searchParams
  const roleFilter = params.role
  const bannedFilter = params.banned === '1'
  const search = params.q?.trim() ?? ''

  let query = supabase
    .from('profiles')
    .select('id,display_name,phone,phone_verified_at,trust_score,banned_until,ban_reason,created_at,user_roles(role)')
    .order('created_at', { ascending: false })
    .limit(300)

  if (bannedFilter) query = query.not('banned_until', 'is', null)
  if (search) {
    query = query.or(`display_name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) {
    return (
      <div className="admin-empty">
        <span className="admin-empty__emoji">⚠️</span>
        <h2 className="admin-empty__title">حصل خطأ</h2>
        <p className="admin-empty__msg">{error.message}</p>
      </div>
    )
  }

  let rows = (data ?? []) as unknown as Profile[]
  if (roleFilter) rows = rows.filter((r) => getRole(r) === roleFilter)

  const now = new Date()
  const counts = {
    total: rows.length,
    customers: rows.filter((r) => getRole(r) === 'customer').length,
    merchants: rows.filter((r) => getRole(r) === 'merchant').length,
    admins: rows.filter((r) => ['admin', 'super_admin'].includes(getRole(r))).length,
    banned: rows.filter((r) => r.banned_until && new Date(r.banned_until) > now).length,
  }

  const tabs = [
    { key: 'all', label: 'الكل', count: counts.total, href: '/admin/users' },
    { key: 'customer', label: 'عملاء', count: counts.customers, href: '/admin/users?role=customer' },
    { key: 'merchant', label: 'تجار', count: counts.merchants, href: '/admin/users?role=merchant' },
    { key: 'admin', label: 'أدمن', count: counts.admins, href: '/admin/users?role=admin' },
    { key: 'banned', label: 'محظورين', count: counts.banned, href: '/admin/users?banned=1' },
  ]

  const currentTab = bannedFilter ? 'banned' : roleFilter ?? 'all'

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">USERS</span>
          <h1 className="admin-header__title">👥 المستخدمين</h1>
          <p className="admin-header__subtitle">
            {counts.total} مستخدم — {counts.customers} عميل، {counts.merchants} تاجر، {counts.admins} أدمن
            {counts.banned > 0 && ` • ${counts.banned} محظور`}
          </p>
        </div>
      </div>

      <div className="usrs-stats">
        <div className="usrs-stat usrs-stat--total">
          <span className="usrs-stat__num">{counts.total}</span>
          <span className="usrs-stat__label">إجمالي</span>
        </div>
        <div className="usrs-stat usrs-stat--customer">
          <span className="usrs-stat__num">{counts.customers}</span>
          <span className="usrs-stat__label">عملاء</span>
        </div>
        <div className="usrs-stat usrs-stat--merchant">
          <span className="usrs-stat__num">{counts.merchants}</span>
          <span className="usrs-stat__label">تجار</span>
        </div>
        <div className="usrs-stat usrs-stat--admin">
          <span className="usrs-stat__num">{counts.admins}</span>
          <span className="usrs-stat__label">أدمن</span>
        </div>
      </div>

      <div className="usrs-tabs">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`usrs-tab ${currentTab === t.key ? 'is-active' : ''}`}
          >
            {t.label}
            <span className="usrs-tab__badge">{t.count}</span>
          </Link>
        ))}
      </div>

      <form className="usrs-search" action="/admin/users" method="get">
        {roleFilter && <input type="hidden" name="role" value={roleFilter} />}
        {bannedFilter && <input type="hidden" name="banned" value="1" />}
        <input
          type="text"
          name="q"
          placeholder="🔎 ابحث بالاسم أو رقم الهاتف..."
          defaultValue={search}
        />
      </form>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__emoji">👤</span>
          <h2 className="admin-empty__title">مفيش مستخدمين هنا</h2>
          <p className="admin-empty__msg">
            {search ? 'مفيش نتائج للبحث ده' : 'جرّب فلتر تاني'}
          </p>
        </div>
      ) : (
        <div className="usrs-list">
          {rows.map((p) => {
            const role = getRole(p)
            const trust = p.trust_score ?? 50
            const trustClass = trust >= 70 ? 'high' : trust >= 40 ? 'mid' : 'low'
            const banned = p.banned_until && new Date(p.banned_until) > now
            const initial = (p.display_name ?? '?').trim().charAt(0).toUpperCase()

            return (
              <article key={p.id} className={`usrs-card ${banned ? 'is-banned' : ''}`}>
                <div className={`usrs-avatar usrs-avatar--${role}`}>{initial}</div>

                <div className="usrs-info">
                  <span className="usrs-name">{p.display_name ?? 'مستخدم'}</span>
                  {p.phone && <span className="usrs-phone">{p.phone}</span>}
                  <div className="usrs-meta">
                    <span className={`usrs-chip usrs-chip--role-${role}`}>
                      {ROLE_EMOJI[role]} {ROLE_LABEL[role] ?? role}
                    </span>
                    {p.phone_verified_at && (
                      <span className="usrs-chip usrs-chip--verified">✓ موثّق</span>
                    )}
                    {banned && (
                      <span className="usrs-chip usrs-chip--banned">🚫 محظور</span>
                    )}
                    <span className="usrs-chip">
                      📅 {new Date(p.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>

                <div className={`usrs-trust usrs-trust--${trustClass}`}>
                  <span className="usrs-trust__num">{trust}</span>
                  <span className="usrs-trust__label">TRUST</span>
                </div>

                <UserActions
                  userId={p.id}
                  isBanned={!!banned}
                  currentRole={role}
                  bannedUntil={p.banned_until}
                />
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
