import type { Metadata } from 'next'
import Link from 'next/link'
import { getActiveOffers, getTrendingBusinesses, getFullProfile } from '@/lib/data'
import { getUserSession } from '@/lib/data/user'
import { isValidLatLng } from '@/lib/utils/distance'
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
  const session = await getUserSession()
  const [all, trending, profile] = await Promise.all([
    getActiveOffers(1000),
    getTrendingBusinesses(1000),
    session ? getFullProfile(session.userId) : Promise.resolve(null),
  ])
  const offers = fairOrderOffers(all, all.length, trending)
  const candidateLocation =
    profile?.default_latitude !== null && profile?.default_latitude !== undefined &&
    profile?.default_longitude !== null && profile?.default_longitude !== undefined
      ? { lat: profile.default_latitude, lng: profile.default_longitude }
      : null
  const viewerLocation = isValidLatLng(candidateLocation) ? candidateLocation : null

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
              <OfferCard key={offer.id} offer={offer} layout="grid" viewerLocation={viewerLocation} />
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
