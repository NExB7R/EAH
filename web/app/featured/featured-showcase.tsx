'use client'

import type { Business } from '@/lib/data'
import BusinessCard from '@/components/business-card'
import { ArrowLeftIcon } from '@/components/icons'
import { useFairRotation } from '@/lib/hooks/use-fair-rotation'
import styles from './featured.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Showcase (/featured)
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
}

const PAGE_SIZES = { mobile: 4, tablet: 6, desktop: 8 }
const INTERVAL_MS = 5000

export default function FeaturedShowcase({ businesses }: Props) {
  const { visible, containerRef, setPaused, next, prev } =
    useFairRotation<Business>({
      items: businesses,
      pageSizes: PAGE_SIZES,
      intervalMs: INTERVAL_MS,
      storageKey: 'eah:featured:page',
    })

  if (businesses.length === 0) return null

  const hasMore = businesses.length > PAGE_SIZES.mobile

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {hasMore && (
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowPrev}`}
          onClick={prev}
          aria-label="السابق"
        >
          <ArrowLeftIcon size={20} />
        </button>
      )}

      <div className={styles.grid}>
        {visible.map((b) => (
          <BusinessCard
            key={b.id}
            business={b}
            tone="gold"
            variant="featured"
          />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowNext}`}
          onClick={next}
          aria-label="التالي"
        >
          <ArrowLeftIcon size={20} />
        </button>
      )}
    </div>
  )
}
