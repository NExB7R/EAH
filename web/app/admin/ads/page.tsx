import { TagIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { getAdSlots, getAllAds } from '@/lib/data/ads'
import AdsManager from './ads-manager'
import AdsFilters from './ads-filters'
import styles from './ads.module.css'

export const dynamic = 'force-dynamic'

type Stats = {
  pending: number
  active: number
  paused: number
  expired: number
}

function computeStats(ads: Awaited<ReturnType<typeof getAllAds>>): Stats {
  return {
    pending: ads.filter((a) => a.status === 'pending').length,
    active: ads.filter((a) => a.status === 'active').length,
    paused: ads.filter((a) => a.status === 'paused').length,
    expired: ads.filter((a) => a.status === 'expired').length,
  }
}

type SearchParams = { status?: string; q?: string }

export default async function AdminAdsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const statusFilter = params.status ?? 'all'
  const q = (params.q ?? '').trim().toLowerCase()

  const [slots, allAds] = await Promise.all([getAdSlots(), getAllAds()])
  const stats = computeStats(allAds)

  let filtered = allAds
  if (statusFilter !== 'all') {
    filtered = filtered.filter((a) => a.status === statusFilter)
  }
  if (q) {
    filtered = filtered.filter(
      (a) => a.title.toLowerCase().includes(q) || (a.business_name ?? '').toLowerCase().includes(q),
    )
  }

  return (
    <div>
      <AccountPageHeader
        title="الإعلانات"
        description={`${allAds.length} إعلان — ${filtered.length} معروض`}
      />

      {/* ─── Stats ─── */}
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} ${stats.pending > 0 ? styles.statWarn : ''}`}>
          <span className={styles.statValue}>{stats.pending}</span>
          <span className={styles.statLabel}>بانتظار الموافقة</span>
        </div>
        <div className={`${styles.statCard} ${styles.statOk}`}>
          <span className={styles.statValue}>{stats.active}</span>
          <span className={styles.statLabel}>نشط</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.paused}</span>
          <span className={styles.statLabel}>متوقف</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.expired}</span>
          <span className={styles.statLabel}>منتهي</span>
        </div>
      </section>

      {/* ─── Slots (collapsible) ─── */}
      {slots.length > 0 && (
        <section className={styles.slotsSection}>
          <h2 className={styles.sectionTitle}>الأماكن الإعلانية ({slots.length})</h2>
          <div className={styles.slotsGrid}>
            {slots.map((s) => (
              <div key={s.id} className={styles.slotCard}>
                <h3 className={styles.slotName}>{s.name_ar}</h3>
                {s.description && <p className={styles.slotDesc}>{s.description}</p>}
                <div className={styles.slotPrice}>
                  <span className={styles.priceNum}>{s.base_price_egp}</span>
                  <span className={styles.priceUnit}>ج.م / أسبوع</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Filters ─── */}
      <AdsFilters />

      {/* ─── Ads ─── */}
      <section className={styles.adsSection}>
        <h2 className={styles.sectionTitle}>الإعلانات ({filtered.length})</h2>
        {filtered.length === 0 ? (
          <EmptyState
            Icon={TagIcon}
            title={allAds.length === 0 ? 'مفيش إعلانات' : 'مفيش نتائج للفلتر'}
            description={q ? 'جرّب بحث تاني' : 'لما يجي طلب إعلان هيظهر هنا'}
          />
        ) : (
          <AdsManager ads={filtered} />
        )}
      </section>
    </div>
  )
}
