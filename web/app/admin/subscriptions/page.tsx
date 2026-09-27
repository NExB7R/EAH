import { createClient } from '@/lib/supabase/server'
import { CrownGoldIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import styles from './subscriptions.module.css'

export const dynamic = 'force-dynamic'

type Row = {
  id: string
  status: string
  is_trial: boolean
  starts_at: string | null
  expires_at: string | null
  plan: { name_ar: string; price_egp: number } | null
  business: { name: string; slug: string } | null
}

async function getSubscriptions(): Promise<Row[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_subscriptions')
    .select(`
      id, status, is_trial, starts_at, expires_at,
      plan:subscription_plans(name_ar, price_egp),
      business:businesses(name, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (data ?? []) as unknown as Row[]
}

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  pending: { label: 'معلّق', tone: 'pending' },
  trial: { label: 'تجربة', tone: 'trial' },
  active: { label: 'نشط', tone: 'active' },
  expired: { label: 'منتهي', tone: 'expired' },
  cancelled: { label: 'ملغي', tone: 'cancelled' },
}

export default async function AdminSubscriptionsPage() {
  const subs = await getSubscriptions()

  return (
    <div>
      <AccountPageHeader
        title="الاشتراكات"
        description={`${subs.length} اشتراك`}
      />

      {subs.length === 0 ? (
        <EmptyState Icon={CrownGoldIcon} title="مفيش اشتراكات" />
      ) : (
        <div className={styles.list}>
          {subs.map((s) => {
            const meta = STATUS_LABEL[s.status] ?? { label: s.status, tone: 'pending' }
            const expires = s.expires_at ? new Date(s.expires_at).toLocaleDateString('ar-EG') : '—'
            return (
              <div key={s.id} className={styles.row}>
                <div className={styles.icon}>
                  <CrownGoldIcon size={20} />
                </div>
                <div className={styles.body}>
                  <div className={styles.name}>
                    {s.business?.name ?? '—'}
                  </div>
                  <div className={styles.meta}>
                    <span>{s.plan?.name_ar ?? '—'}</span>
                    <span className={styles.dot}>·</span>
                    <span>{s.plan?.price_egp ?? 0} ج.م</span>
                    <span className={styles.dot}>·</span>
                    <span>ينتهي: {expires}</span>
                  </div>
                </div>
                <span className={`${styles.status} ${styles[meta.tone]}`}>
                  {s.is_trial && '✨ '}{meta.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
