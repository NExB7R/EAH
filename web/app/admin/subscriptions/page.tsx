import { createClient } from '@/lib/supabase/server'
import { CrownGoldIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import SubscriptionRow from './subscription-row'
import SubscriptionFilters from './subscription-filters'
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
    .select(
      `
      id, status, is_trial, starts_at, expires_at,
      plan:subscription_plans(name_ar, price_egp),
      business:businesses(name, slug)
    `,
    )
    .order('created_at', { ascending: false })
    .limit(200)

  return (data ?? []) as unknown as Row[]
}

type SearchParams = { status?: string; q?: string }

type Stats = {
  active: number
  pending: number
  trial: number
  expiringSoon: number
}

function computeStats(subs: Row[]): Stats {
  const now = Date.now()
  const weekFromNow = now + 7 * 24 * 60 * 60 * 1000
  return {
    active: subs.filter((s) => s.status === 'active').length,
    pending: subs.filter((s) => s.status === 'pending').length,
    trial: subs.filter((s) => s.status === 'trial' || s.is_trial).length,
    expiringSoon: subs.filter((s) => {
      if (s.status !== 'active' && s.status !== 'trial') return false
      if (!s.expires_at) return false
      const exp = new Date(s.expires_at).getTime()
      return exp > now && exp <= weekFromNow
    }).length,
  }
}

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const statusFilter = params.status ?? 'all'
  const q = (params.q ?? '').trim().toLowerCase()

  const all = await getSubscriptions()

  // ─── Stats ───
  const stats = computeStats(all)

  // ─── Filter ───
  let filtered = all
  if (statusFilter !== 'all') {
    filtered = filtered.filter((s) => s.status === statusFilter)
  }
  if (q) {
    filtered = filtered.filter((s) => (s.business?.name ?? '').toLowerCase().includes(q))
  }

  return (
    <div>
      <AccountPageHeader
        title="الاشتراكات"
        description={`${all.length} اشتراك — ${filtered.length} معروض`}
      />

      {/* Stats */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.active}</span>
          <span className={styles.statLabel}>نشط</span>
        </div>
        <div className={`${styles.statCard} ${stats.pending > 0 ? styles.statWarn : ''}`}>
          <span className={styles.statValue}>{stats.pending}</span>
          <span className={styles.statLabel}>بانتظار موافقة</span>
        </div>
        <div className={`${styles.statCard} ${styles.statGold}`}>
          <span className={styles.statValue}>{stats.trial}</span>
          <span className={styles.statLabel}>تجربة مجانية</span>
        </div>
        <div className={`${styles.statCard} ${stats.expiringSoon > 0 ? styles.statWarn : ''}`}>
          <span className={styles.statValue}>{stats.expiringSoon}</span>
          <span className={styles.statLabel}>تنتهي خلال 7 أيام</span>
        </div>
      </section>

      <SubscriptionFilters />

      {filtered.length === 0 ? (
        <EmptyState
          Icon={CrownGoldIcon}
          title={all.length === 0 ? 'مفيش اشتراكات' : 'مفيش نتائج للفلتر'}
          description={q ? 'جرّب بحث تاني' : 'لما يجي اشتراك جديد هيظهر هنا'}
        />
      ) : (
        <div className={styles.list}>
          {filtered.map((s) => (
            <SubscriptionRow key={s.id} sub={s} />
          ))}
        </div>
      )}
    </div>
  )
}
