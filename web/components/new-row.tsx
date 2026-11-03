import Link from 'next/link'
import BusinessCard from './business-card'
import { SunriseIcon, ArrowLeftIcon } from './icons'
import RowCarousel from './row-carousel'
import type { Business } from '@/lib/data'
import styles from './new-row.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — New Row (Home)
//   • Unified BusinessCard
//   • Smart layout: ≤3 items → centered grid, >3 → carousel
// ═══════════════════════════════════════════════════════════

type Props = { businesses: Business[]; favoriteIds?: Set<string>; limit?: number }

export default function NewRow({ businesses, limit = 12, favoriteIds = new Set() }: Props) {
  if (businesses.length === 0) return null
  const visible = businesses.slice(0, limit)
  const useGrid = visible.length <= 3

  const cards = visible.map((b) => (
    <div key={b.id} className={styles.cardWrap}>
      <BusinessCard business={b} tone="pink" context="new" isFavorite={favoriteIds.has(b.id)} />
    </div>
  ))

  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}>
              <SunriseIcon size={22} />
            </span>
            <div className={styles.titleText}>
              <h2 className={styles.title}>الأنشطة الجديدة</h2>
              <p className={styles.subtitle}>مساحة دعم لأول شهر من انطلاق النشاط</p>
            </div>
          </div>

          <Link href="/new" className={styles.viewAll}>
            <span>شوف الكل</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </header>

        <div className={styles.neonLine} aria-hidden />

        {useGrid ? (
          <div
            className={`${styles.centeredGrid} ${visible.length === 1 ? styles.singleCard : ''}`}
          >
            {cards}
          </div>
        ) : (
          <RowCarousel accent="#F472B6">{cards}</RowCarousel>
        )}
      </div>
    </section>
  )
}
