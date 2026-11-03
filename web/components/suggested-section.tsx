'use client'

import BusinessCard from './business-card'
import RowCarousel from './row-carousel'
import { SparkleStarIcon, ArrowLeftIcon } from './icons'
import type { Business } from '@/lib/data'
import type { LatLng } from '@/lib/utils/distance'
import styles from './suggested-section.module.css'

type Props = {
  businesses: Business[]
  description: string
  favoriteIds?: Set<string>
  viewerLocation: LatLng | null
}

export default function SuggestedSection({
  businesses,
  description,
  favoriteIds = new Set<string>(),
  viewerLocation,
}: Props) {
  // No signal = no section. Never invent recommendations for a new or anonymous user.
  if (businesses.length < 2) return null

  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}><SparkleStarIcon size={22} /></span>
            <div>
              <h2 className={styles.title}>المرشح لك</h2>
              <p className={styles.subtitle}>{description}</p>
            </div>
          </div>
        </header>

        <div className={styles.neonLine} aria-hidden />

        <RowCarousel accent="#E0B8FF">
          {businesses.map((business) => (
            <div className={styles.cardWrap} key={business.id}>
              <BusinessCard
                business={business}
                tone="purple"
                context="default"
                isFavorite={favoriteIds.has(business.id)}
                viewerLocation={viewerLocation}
                showDistance={!!viewerLocation}
              />
            </div>
          ))}
        </RowCarousel>
      </div>
    </section>
  )
}
