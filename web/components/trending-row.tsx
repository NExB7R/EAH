import Link from 'next/link'
import BusinessCard from './business-card'
import { TrendingUpIcon, ArrowLeftIcon } from './icons'
import RowCarousel from './row-carousel'
import type { Business } from '@/lib/data'
import styles from './trending-row.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Trending Row (Home)
//   • Unified BusinessCard
//   • Smart layout: ≤3 items → centered grid, >3 → carousel
// ═══════════════════════════════════════════════════════════

type Props = { businesses: Business[]; limit?: number }

export default function TrendingRow({ businesses, limit = 12 }: Props) {
  if (businesses.length === 0) return null
  const visible = businesses.slice(0, limit)
  const useGrid = visible.length <= 3

  const cards = visible.map((b, i) => (
    <div key={b.id} className={styles.cardWrap}>
      <BusinessCard business={b} tone="orange" context="trending" rank={i + 1} />
    </div>
  ))

  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}>
              <TrendingUpIcon size={22} />
            </span>
            <h2 className={styles.title}>الترند</h2>
          </div>

          <Link href="/trends" className={styles.viewAll}>
            <span>شوف الكل</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </header>

        <div className={styles.neonLine} aria-hidden />

        {useGrid ? (
          <div className={styles.centeredGrid}>{cards}</div>
        ) : (
          <RowCarousel accent="#FDBA74">{cards}</RowCarousel>
        )}
      </div>
    </section>
  )
}
