import { createClient } from '@/lib/supabase/server'
import { UserIcon, ShieldCheckIcon, ShieldIcon, AlertIcon, StarIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import Avatar from '@/components/avatar'
import styles from './users.module.css'

export const dynamic = 'force-dynamic'

type Row = {
  id: string
  display_name: string
  avatar_url: string | null
  phone: string | null
  phone_verified_at: string | null
  trust_score: number
  trust_tier: string
  created_at: string
  role: string | null
}

async function getUsers(): Promise<Row[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select(`
      id, display_name, avatar_url, phone, phone_verified_at,
      trust_score, trust_tier, created_at,
      user_roles(role)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (data ?? []).map((p: Record<string, unknown>) => {
    const roles = p.user_roles as Array<{ role: string }> | undefined
    return {
      id: p.id as string,
      display_name: p.display_name as string,
      avatar_url: p.avatar_url as string | null,
      phone: p.phone as string | null,
      phone_verified_at: p.phone_verified_at as string | null,
      trust_score: p.trust_score as number,
      trust_tier: p.trust_tier as string,
      created_at: p.created_at as string,
      role: roles?.[0]?.role ?? null,
    }
  })
}

const TIER_LABEL: Record<string, string> = {
  trusted: 'موثوق',
  verified: 'موثّق',
  new: 'جديد',
}

const ROLE_LABEL: Record<string, string> = {
  customer: 'عميل',
  merchant: 'تاجر',
  admin: 'أدمن',
  super_admin: 'سوبر أدمن',
}

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div>
      <AccountPageHeader
        title="المستخدمين"
        description={`${users.length} مستخدم`}
      />

      {users.length === 0 ? (
        <EmptyState Icon={UserIcon} title="مفيش مستخدمين" />
      ) : (
        <div className={styles.list}>
          {users.map((u) => {
            const date = new Date(u.created_at).toLocaleDateString('ar-EG')
            const roleLabel = u.role ? ROLE_LABEL[u.role] ?? u.role : 'عميل'
            return (
              <div key={u.id} className={styles.row}>
                <Avatar
                  displayName={u.display_name}
                  avatarUrl={u.avatar_url}
                  role={(u.role as never) ?? 'customer'}
                  phoneVerified={!!u.phone_verified_at}
                  size="md"
                />
                <div className={styles.body}>
                  <div className={styles.nameRow}>
                    <span className={styles.name}>{u.display_name}</span>
                    <span className={`${styles.role} ${styles['role_' + (u.role ?? 'customer')]}`}>
                      {roleLabel}
                    </span>
                  </div>
                  <div className={styles.meta}>
                    {u.phone && <span>{u.phone}</span>}
                    <span className={styles.dot}>·</span>
                    <span>{TIER_LABEL[u.trust_tier] ?? u.trust_tier}</span>
                    <span className={styles.dot}>·</span>
                    <span>انضم {date}</span>
                  </div>
                </div>
                <span className={styles.trust}>
                  <StarIcon size={12} />
                  {u.trust_score}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
