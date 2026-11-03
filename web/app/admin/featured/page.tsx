import Link from 'next/link'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { CrownGoldIcon, PlusIcon, ClockIcon, CheckCircleIcon } from '@/components/icons'
import { getFeaturedBusinesses } from '@/lib/data/admin'
import FeaturedList from './featured-list'
import FeaturedFilters from './featured-filters'
import styles from './featured.module.css'

export const dynamic = 'force-dynamic'

type Stats = {
  total: number
  active: number
  expiringSoon: number
}

function isExpiringSoon(until: string | null): boolean {
  if (!until) return false
  const now = Date.now()
  const week = now + 7 * 24 * 60 * 60 * 1000
  const exp = new Date(until).getTime()
  return exp > now && exp <= week
}

function computeStats(businesses: Awaited<ReturnType<typeof getFeaturedBusinesses>>): Stats {
  const featured = businesses.filter((b) => b.is_featured)
  return {
    total: featured.length,
    active: featured.filter((b) =>
      b.is_published && b.paid_featured_home_eligible,
    ).length,
    expiringSoon: featured.filter((b) =>
      b.paid_featured_home_eligible && isExpiringSoon(b.paid_featured_home_expires_at),
    ).length,
  }
}

type SearchParams = { q?: string; filter?: string }

export default async function AdminFeaturedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const q = (params.q ?? '').trim().toLowerCase()
  const filter = params.filter ?? 'all'

  const businesses = await getFeaturedBusinesses()
  const featured = businesses.filter((b) => b.is_featured)
  const stats = computeStats(businesses)

  let filtered = featured
  if (filter === 'expiring') {
    filtered = filtered.filter((b) => isExpiringSoon(b.paid_featured_home_expires_at))
  }
  if (q) filtered = filtered.filter((b) => b.name.toLowerCase().includes(q))

  return (
    <div>
      <AccountPageHeader
        title="إدارة المميزين"
        description={`${stats.active} مؤهل للظهور من ${stats.total} محدد إداريًا`}
      />

      {/* ─── Stats ─── */}
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statGold}`}>
          <span className={styles.statIcon}>
            <CrownGoldIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>إجمالي المميزين</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>
            <CheckCircleIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.active}</span>
            <span className={styles.statLabel}>مؤهل للظهور الآن</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${stats.expiringSoon > 0 ? styles.statWarn : ''}`}>
          <span className={styles.statIcon}>
            <ClockIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.expiringSoon}</span>
            <span className={styles.statLabel}>تنتهي خلال 7 أيام</span>
          </div>
        </div>
      </section>

      {/* ─── Action Bar ─── */}
      <div className={styles.actionBar}>
        <FeaturedFilters />
        <Link href="/admin/businesses" className={styles.addBtn}>
          <PlusIcon size={14} />
          <span>إضافة مميز</span>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          Icon={CrownGoldIcon}
          title={featured.length === 0 ? 'مفيش أنشطة مميزة حاليًا' : 'مفيش نتائج للفلتر'}
          description={q ? 'جرّب بحث تاني' : 'اختار نشاط من قائمة الأنشطة وحدده كمميز'}
        />
      ) : (
        <FeaturedList businesses={filtered} />
      )}
    </div>
  )
}
