'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import BusinessCard from './business-card'
import { NavigationIcon, ArrowLeftIcon, LocationIcon } from './icons'
import RowCarousel from './row-carousel'
import { useGeo } from '@/lib/contexts/geo-context'
import { filterAndRankNearbyBusinesses } from '@/lib/utils/nearby'
import type { Business } from '@/lib/data'
import styles from './nearby-grid.module.css'

// EAH — Homepage nearby section.
// Location is opt-in; without permission, show the established Shibin fallback.

type Props = { businesses: Business[]; favoriteIds?: Set<string> }

export default function NearbyGrid({ businesses, favoriteIds = new Set() }: Props) {
  const geo = useGeo()
  const userLocation = geo.status === 'granted' ? geo.location : null
  const nearby = useMemo(
    () => filterAndRankNearbyBusinesses(businesses, userLocation),
    [businesses, userLocation],
  )
  const visible = nearby.slice(0, 12)
  const useGrid = visible.length <= 3

  if (businesses.length === 0) return null

  const cards = visible.map((business) => (
    <div key={business.id} className={styles.cardWrap}>
      <BusinessCard
        business={business}
        tone="purple"
        context="nearby"
        isFavorite={favoriteIds.has(business.id)}
      />
    </div>
  ))

  const subtitle =
    geo.status === 'granted'
      ? 'أقرب الأنشطة ليك في نطاق 5 كم'
      : geo.status === 'denied'
        ? 'الموقع غير متاح — بنعرض أنشطة شبين القناطر'
        : geo.status === 'loading'
          ? 'بنحدد موقعك، وهنرتب الأقرب ليك'
          : 'أنشطة شبين القناطر — حدّد موقعك لعرض الأقرب ليك'

  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}>
              <NavigationIcon size={22} />
            </span>
            <div className={styles.titleText}>
              <h2 className={styles.title}>قريب منك</h2>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            {geo.status === 'idle' && (
              <button type="button" className={styles.locationAction} onClick={geo.request}>
                <LocationIcon size={14} />
                <span>استخدم موقعي</span>
              </button>
            )}
            <Link href="/nearby" className={styles.viewAll}>
              <span>شوف الكل</span>
              <ArrowLeftIcon size={16} />
            </Link>
          </div>
        </header>

        <div className={styles.neonLine} aria-hidden />

        {geo.status === 'granted' && visible.length === 0 ? (
          <div className={styles.emptyNearby}>
            <p>مفيش أنشطة بموقع محدد داخل 5 كم منك حاليًا.</p>
            <Link href="/explore">استكشف كل الأنشطة</Link>
          </div>
        ) : visible.length === 0 ? (
          <div className={styles.emptyNearby}>
            <p>لسه مفيش أنشطة متاحة في شبين القناطر.</p>
            <Link href="/explore">استكشف كل الأنشطة</Link>
          </div>
        ) : useGrid ? (
          <div className={`${styles.centeredGrid} ${visible.length === 1 ? styles.singleCard : ''}`}>
            {cards}
          </div>
        ) : (
          <RowCarousel accent="#55E7D1">{cards}</RowCarousel>
        )}
      </div>
    </section>
  )
}
