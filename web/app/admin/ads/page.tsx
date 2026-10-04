import { TagIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { getAdSlots, getAllAds } from '@/lib/data/ads'
import AdsManager from './ads-manager'
import styles from './ads.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminAdsPage() {
  const [slots, ads] = await Promise.all([getAdSlots(), getAllAds()])

  const pendingCount = ads.filter((a) => a.status === 'pending').length
  const activeCount = ads.filter((a) => a.status === 'active').length

  return (
    <div>
      <AccountPageHeader
        title="الإعلانات"
        description={`${pendingCount} طلب بانتظار — ${activeCount} إعلان نشط`}
      />

      <section className={styles.intro}>
        <span className={styles.introIcon}>
          <TagIcon size={20} />
        </span>
        <p className={styles.introText}>
          راجع طلبات الإعلانات، ووافق أو ارفض. الإعلانات المعتمدة بتظهر تلقائياً في الأماكن المخصصة.
        </p>
      </section>

      <section className={styles.slotsSection}>
        <h2 className={styles.sectionTitle}>الأماكن الإعلانية</h2>
        {slots.length === 0 ? (
          <EmptyState Icon={TagIcon} title="مفيش أماكن إعلانية" />
        ) : (
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
        )}
      </section>

      <section className={styles.adsSection}>
        <h2 className={styles.sectionTitle}>الإعلانات ({ads.length})</h2>
        <AdsManager ads={ads} />
      </section>
    </div>
  )
}
