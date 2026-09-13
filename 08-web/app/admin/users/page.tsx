import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import UserActions from '@/components/admin/user-actions'

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

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; banned?: string; q?: string }>
}) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const params = await searchParams
  const roleFilter = params.role
  const bannedFilter = params.banned === '1'
  const search = params.q?.trim() ?? ''

  let query = supabase
    .from('profiles')
    .select('id,display_name,phone,phone_verified_at,trust_score,banned_until,ban_reason,created_at,user_roles(role)')
    .order('created_at', { ascending: false })
    .limit(300)

  if (bannedFilter) {
    query = query.not('banned_until', 'is', null)
  }
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
  if (roleFilter) {
    rows = rows.filter((r) => getRole(r) === roleFilter)
  }

  const counts = {
    total: rows.length,
    customers: rows.filter((r) => getRole(r) === 'customer').length,
    merchants: rows.filter((r) => getRole(r) === 'merchant').length,
    admins: rows.filter((r) => ['admin', 'super_admin'].includes(getRole(r))).length,
    banned: rows.filter((r) => r.banned_until && new Date(r.banned_until) > new Date()).length,
  }

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">USERS</span>
          <h1 className="admin-header__title">👥 المستخدمين</h1>
          <p className="admin-header__subtitle">
            {counts.total} مستخدم — {counts.customers} عميل، {counts.merchants} تاجر، {counts.admins} أدمن، {counts.banned} محظور
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-toolbar" style={{ marginBottom: 16 }}>
        <a href="/admin/users" className={`admin-btn admin-btn--sm ${!roleFilter && !bannedFilter ? 'admin-btn--primary' : ''}`}>
          الكل
        </a>
        <a href="/admin/users?role=customer" className={`admin-btn admin-btn--sm ${roleFilter === 'customer' ? 'admin-btn--primary' : ''}`}>
          عملاء ({counts.customers})
        </a>
        <a href="/admin/users?role=merchant" className={`admin-btn admin-btn--sm ${roleFilter === 'merchant' ? 'admin-btn--primary' : ''}`}>
          تجار ({counts.merchants})
        </a>
        <a href="/admin/users?role=admin" className={`admin-btn admin-btn--sm ${roleFilter === 'admin' ? 'admin-btn--primary' : ''}`}>
          أدمن ({counts.admins})
        </a>
        <a href="/admin/users?banned=1" className={`admin-btn admin-btn--sm ${bannedFilter ? 'admin-btn--danger' : ''}`}>
          🚫 محظورين ({counts.banned})
        </a>
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__emoji">👥</span>
          <h2 className="admin-empty__title">مفيش مستخدمين</h2>
          <p className="admin-empty__msg">لسه محدش سجل في المنصة</p>
        </div>
      ) : (
        <div className="admin-grid admin-grid--cards">
          {rows.map((u) => {
            const role = getRole(u)
            const isBanned = !!(u.banned_until && new Date(u.banned_until) > new Date())
            const initial = (u.display_name ?? 'ز').charAt(0).toUpperCase()

            return (
              <article key={u.id} className="user-card">
                <div className="user-card__head">
                  <div className={`user-card__avatar ${isBanned ? 'is-banned' : ''}`}>
                    {initial}
                  </div>
                  <div className="user-card__info">
                    <h3 className="user-card__name">{u.display_name ?? 'بدون اسم'}</h3>
                    <div className="user-card__phone">{u.phone ?? '—'}</div>
                    <div className="user-card__badges">
                      <span className={`user-card__badge user-card__badge--${role}`}>{role}</span>
                      {u.phone_verified_at && (
                        <span className="user-card__badge user-card__badge--verified">✓ موثّق</span>
                      )}
                      {isBanned && (
                        <span className="user-card__badge user-card__badge--banned">🚫 محظور</span>
                      )}
                      {u.trust_score !== null && u.trust_score !== undefined && (
                        <span className="user-card__badge">⭐ {u.trust_score}</span>
                      )}
                    </div>
                  </div>
                </div>

                {isBanned && u.ban_reason && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--eah-red)', padding: '6px 10px', background: 'rgba(248,113,113,0.08)', borderRadius: 10, border: '1px solid rgba(248,113,113,0.2)' }}>
                    سبب الحظر: {u.ban_reason}
                  </div>
                )}

                <UserActions
                  userId={u.id}
                  isBanned={isBanned}
                  currentRole={role}
                  bannedUntil={u.banned_until}
                />
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
