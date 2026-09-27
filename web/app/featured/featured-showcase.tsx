'use client'

import { useEffect, useState } from 'react'
import type { Business } from '@/lib/data'
import FeaturedCard from '@/components/featured-card'
import { FEATURED_ROTATION_MS } from '@/lib/featured-rotation'
import styles from './featured.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Showcase (صفحات + أرقام — نفس منطق Home)
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
  initialStart: number
}

const PAGE_SIZE = 10

export default function FeaturedShowcase({ businesses, initialStart }: Props) {
  const totalPages = Math.max(1, Math.ceil(businesses.length / PAGE_SIZE))
  const initialPage = Math.max(0, initialStart % totalPages)
  const [page, setPage] = useState(initialPage)

  useEffect(() => {
    if (totalPages <= 1) return
    const timer = setInterval(() => {
      setPage((p) => (p + 1) % totalPages)
    }, FEATURED_ROTATION_MS)
    return () => clearInterval(timer)
  }, [totalPages])

  const start = page * PAGE_SIZE
  const visible = businesses.slice(start, start + PAGE_SIZE)

  return (
    <>
      {totalPages > 1 && (
        <div className={styles.timerRow} aria-hidden>
          <div className={styles.progressLine}>
            <span key={page} className={styles.progressFill} />
          </div>
          <span className={styles.pageLabel}>
            {page + 1} / {totalPages}
          </span>
        </div>
      )}

      <div className={styles.grid}>
        {visible.map((b, i) => (
          <FeaturedCard key={b.id} business={b} priority={i < 4} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className={styles.pager} aria-label="صفحات المميزين">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.pageNum} ${i === page ? styles.pageNumActive : ''}`}
              onClick={() => setPage(i)}
              aria-label={`صفحة ${i + 1}`}
              aria-current={i === page ? 'page' : undefined}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      )}
    </>
  )
}
