import type { Metadata } from 'next'
import Link from 'next/link'
import { getActiveOffers } from '@/lib/data'
import { fairOrderOffers } from '@/lib/fair-ranking'
import { GiftIcon, TargetIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import { OfferCard } from '@/components/offers-strip'
import styles from './offers-page.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'العروض',
  description: 'أحدث العروض في شبين القناطر والقرى حواليها',
}

export default async function OffersPage() {
  const all = await getActiveOffers(500)
  const offers = fairOrderOffers(all, all.length)

  return (
    <main className={styles.page}>
      <SecondaryHero
        activeKey="offers"
        title="العروض"
        Icon={GiftIcon}
        tone="purple"
        count={offers.length}
        countLabel="عرض"
      />

      <div className={styles.content}>
        {offers.length > 0 ? (
          <div className={styles.grid}>
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} layout="grid" />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden>
              <TargetIcon size={38} />
            </span>
            <h2 className={styles.emptyTitle}>لسه مفيش عروض متاحة</h2>
            <p className={styles.emptyText}>
              تابع الأنشطة القريبة منك، والعروض الجديدة هتظهر هنا أول ما تنزل.
            </p>
            <Link href="/explore" className={styles.emptyLink}>
              اكتشف الأنشطة
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
