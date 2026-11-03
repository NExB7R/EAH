import Link from 'next/link'
import BusinessCard from './business-card'
import NearbyLocationPrompt from './nearby-location-prompt'
import { NavigationIcon, ArrowLeftIcon } from './icons'
import RowCarousel from './row-carousel'
import type { Business } from '@/lib/data'
import type { LatLng } from '@/lib/utils/distance'
import styles from './nearby-grid.module.css'

type Props = {
  businesses: Business[]
  favoriteIds?: Set<string>
  isLoggedIn: boolean
  viewerLocation: LatLng | null
  viewerArea: string | null
}

export default function NearbyGrid({
  businesses,
  favoriteIds = new Set(),
  isLoggedIn,
  viewerLocation,
  viewerArea,
}: Props) {
  const visible = businesses.slice(0, 12)
  const useGrid = visible.length <= 3

  const cards = visible.map((business) => (
    <div key={business.id} className={styles.cardWrap}>
      <BusinessCard
        business={business}
        tone="purple"
        context="nearby"
        isFavorite={favoriteIds.has(business.id)}
        viewerLocation={viewerLocation}
        showDistance={!!viewerLocation}
      />
    </div>
  ))

  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}><NavigationIcon size={22} /></span>
            <div>
              <h2 className={styles.title}>قريب منك</h2>
              <p className={styles.subtitle}>
                {viewerLocation ? 'مرتبة حسب المسافة الفعلية' : viewerArea ? `أنشطة في ${viewerArea}` : 'اكتشف الأنشطة الأقرب لمكانك'}
              </p>
            </div>
          </div>
          <Link href="/nearby" className={styles.viewAll}>
            <span>شوف الكل</span><ArrowLeftIcon size={16} />
          </Link>
        </header>

        <div className={styles.neonLine} aria-hidden />

        {!isLoggedIn ? (
          <NearbyLocationPrompt isLoggedIn={false} />
        ) : !viewerLocation ? (
          <div className={styles.locationArea}>
            {viewerArea && visible.length > 0 && (
              <div className={styles.areaResults}>
                {useGrid ? <div className={styles.centeredGrid}>{cards}</div> : <RowCarousel accent="#55E7D1">{cards}</RowCarousel>}
              </div>
            )}
            <NearbyLocationPrompt isLoggedIn onLocationSaved={() => undefined} />
          </div>
        ) : visible.length > 0 ? (
          useGrid ? (
            <div className={`${styles.centeredGrid} ${visible.length === 1 ? styles.singleCard : ''}`}>{cards}</div>
          ) : (
            <RowCarousel accent="#55E7D1">{cards}</RowCarousel>
          )
        ) : (
          <div className={styles.emptyNearby}>
            <span>مفيش أنشطة مسجلة في نطاق 5 كم من موقعك حاليًا.</span>
            <Link href="/explore">استكشف كل الأنشطة</Link>
          </div>
        )}
      </div>
    </section>
  )
}
