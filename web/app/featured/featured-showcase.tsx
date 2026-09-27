'use client'

import type { Business } from '@/lib/data'
import FeaturedCard from '@/components/featured-card'
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/components/icons'
import { useFairRotation } from '@/lib/hooks/use-fair-rotation'
import styles from './featured.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Showcase (/featured)
//   • 12 / 9 / 6 حسب الشاشة
//   • Fisher-Yates (عشوائي عادل كل Reload)
//   • Pagination كاملة + أسهم hover
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
}

const PAGE_SIZES = { mobile: 6, tablet: 9, desktop: 12 }
const INTERVAL_MS = 5000

// Pagination: 1 … 4 5 [6] 7 8 … 17
function pageNumbers(current: number, total: number): (number | 'dots')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i)
  }
  const set = new Set<number>()
  set.add(0)
  set.add(total - 1)
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 0 && i < total) set.add(i)
  }
  const sorted = [...set].sort((a, b) => a - b)
  const out: (number | 'dots')[] = []
  let prev = -1
  for (const n of sorted) {
    if (prev >= 0 && n - prev > 1) out.push('dots')
    out.push(n)
    prev = n
  }
  return out
}

export default function FeaturedShowcase({ businesses }: Props) {
  const {
    visible,
    containerRef,
    setPaused,
    next,
    prev,
    goToPage,
    currentPage,
    totalPages,
  } = useFairRotation<Business>({
    items: businesses,
    pageSizes: PAGE_SIZES,
    intervalMs: INTERVAL_MS,
    storageKey: 'eah:featured:page',
  })

  if (businesses.length === 0) return null

  const hasMore = totalPages > 1
  const pages = pageNumbers(currentPage, totalPages)

  return (
    <>
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
            <FeaturedCard key={b.id} business={b} variant="small" />
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

      {hasMore && (
        <nav className={styles.pagination} aria-label="تصفح الصفحات">
          <button
            type="button"
            className={styles.pageBtn}
            onClick={prev}
            disabled={currentPage === 0}
            aria-label="السابق"
          >
            <ChevronRightIcon size={14} />
          </button>

          {pages.map((p, i) =>
            p === 'dots' ? (
              <span key={`d-${i}`} className={styles.pageDots}>…</span>
            ) : (
              <button
                key={p}
                type="button"
                className={`${styles.pageBtn} ${
                  p === currentPage ? styles.pageBtnActive : ''
                }`}
                onClick={() => goToPage(p)}
                aria-current={p === currentPage ? 'page' : undefined}
              >
                {p + 1}
              </button>
            ),
          )}

          <button
            type="button"
            className={styles.pageBtn}
            onClick={next}
            disabled={currentPage === totalPages - 1}
            aria-label="التالي"
          >
            <ChevronLeftIcon size={14} />
          </button>
        </nav>
      )}
    </>
  )
}
