'use client'

import Link from 'next/link'
import type { Business } from '@/lib/data'
import BusinessCard from './business-card'
import { CrownGoldIcon, ArrowLeftIcon } from './icons'
import { useFairRotation } from '@/lib/hooks/use-fair-rotation'
import styles from './featured-bento.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Bento (Home) — Premium 2026
//   • عدالة 100% (Fisher-Yates + sessionStorage)
//   • 8/6/4 حسب الشاشة
//   • تبديل يدوي بأسهم + تلقائي كل 5 ثواني
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
}

const PAGE_SIZES = { mobile: 4, tablet: 6, desktop: 8 }
const INTERVAL_MS = 8000

export default function FeaturedBento({ businesses }: Props) {
  const { visible, containerRef, setPaused, next, prev, pageSize } = useFairRotation<Business>({
    items: businesses,
    pageSizes: PAGE_SIZES,
    intervalMs: INTERVAL_MS,
    storageKey: 'eah:featured:home:v2',
  })

  if (businesses.length === 0) return null

  const hasMore = businesses.length > pageSize

  return (
    <section ref={containerRef as React.RefObject<HTMLElement>} className={styles.section}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}>
              <CrownGoldIcon size={22} />
            </span>
            <h2 className={styles.title}>المميزون</h2>
          </div>

          <Link href="/featured" className={styles.viewAll}>
            <span>شوف الكل</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </header>

        <div className={styles.neonLine} aria-hidden />

        <div
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
                context="featured"
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
      </div>
    </section>
  )
}
