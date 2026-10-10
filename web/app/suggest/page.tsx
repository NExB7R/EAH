import type { Metadata } from 'next'
import { SparkleStarIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import BusinessCard from '@/components/business-card'
import { getUserSession } from '@/lib/data/user'
import { getSuggestedBusinesses } from '@/lib/data/suggest'
import { fairOrder } from '@/lib/fair-ranking'
import styles from './suggest.module.css'

export const metadata: Metadata = {
  title: 'ارشحلك · EAH',
  description: 'ترشيحات على مزاجك — من قلب شبين القناطر',
}

export const dynamic = 'force-dynamic'

const REASON_TITLE: Record<string, string> = {
  personal: 'على مزاجك',
  trending: 'الأعلى تقييماً',
  new_user: 'ابدأ من هنا',
}

const REASON_SUB: Record<string, string> = {
  personal: 'اقتراحات مبنية على اللي عجبك وتابعه',
  trending: 'الأماكن الأعلى تقييماً في المنطقة',
  new_user: 'أماكن مختارة عشان تبدأ رحلتك',
}

export default async function SuggestPage() {
  const session = await getUserSession()
  const { businesses: raw, reason } = await getSuggestedBusinesses(session?.userId ?? null)
  const businesses = fairOrder(raw, 'suggest', {}, { topWindow: 10, maxPerType: 3 })

  return (
    <main className={styles.page}>
      <SecondaryHero activeKey="suggest" title="ارشحلك" Icon={SparkleStarIcon} tone="blue" />

      <section className={styles.section}>
        {businesses.length === 0 ? (
          <div className={styles.empty}>
            <p>لسه محتاجين نعرفك أكتر</p>
            <p className={styles.emptyHint}>تصفح أنشطة وابدأ رحلتك</p>
          </div>
        ) : (
          <>
            <div className={styles.reason}>
              <span className={styles.reasonIcon}>
                <SparkleStarIcon size={18} />
              </span>
              <div>
                <h2 className={styles.reasonTitle}>{REASON_TITLE[reason]}</h2>
                <p className={styles.reasonSub}>{REASON_SUB[reason]}</p>
              </div>
            </div>

            <div className={styles.grid}>
              {businesses.map((b) => (
                <BusinessCard key={b.id} business={b} tone="purple" />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
