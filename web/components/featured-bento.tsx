'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Business } from '@/lib/data'
import FeaturedCard from './featured-card'
import { CrownGoldIcon, ArrowLeftIcon } from './icons'
import { FEATURED_ROTATION_MS } from '@/lib/featured-rotation'
import styles from './featured-bento.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Bento (2026 — صفحات + أرقام)
//   • 10 كروت في الصفحة
//   • دوران تلقائي كل 10 ثواني
//   • أرقام تحت → قلب يدوي
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
  initialStart: number
}

const PAGE_SIZE = 10

export default function FeaturedBento({ businesses, initialStart }: Props) {
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

  if (businesses.length === 0) return null

  const start = page * PAGE_SIZE
  const visible = businesses.slice(start, start + PAGE_SIZE)
  const nextPage = (page + 1) % totalPages
  const nextBusiness = businesses[nextPage * PAGE_SIZE]

  return (
    <section className={`eah-section-bg ${styles.section}`}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}>
              <CrownGoldIcon size={22} />
            </span>
            <h2 className={styles.title}>المميزون</h2>
            <span className={styles.titleBadge}>Premium 2026</span>
          </div>

          <Link href="/featured" className={styles.viewAll}>
            <span>شوف الكل</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </header>

        <div className={styles.timerRow} aria-hidden>
          <div className={styles.progressLine}>
            <span key={page} className={styles.progressFill} />
          </div>
          {nextBusiness && totalPages > 1 && (
            <span className={styles.nextChip}>
              القادم · {nextBusiness.name}
            </span>
          )}
        </div>

        <div className={styles.grid}>
          {visible.map((b, i) => (
            <FeaturedCard key={b.id} business={b} priority={i < 3} />
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
      </div>
    </section>
  )
}
