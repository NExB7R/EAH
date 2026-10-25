import Link from 'next/link'
import BusinessCard from './business-card'
import { NavigationIcon, ArrowLeftIcon } from './icons'
import RowCarousel from './row-carousel'
import type { Business } from '@/lib/data'
import styles from './nearby-grid.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Nearby Grid (Home)
//   • Unified BusinessCard
//   • Smart layout: ≤3 items → centered grid, >3 → carousel
//   • Location CTA moved to /nearby page
// ═══════════════════════════════════════════════════════════

type Props = { businesses: Business[] }

export default function NearbyGrid({ businesses }: Props) {
  if (businesses.length === 0) return null
  const visible = businesses.slice(0, 12)
  const useGrid = visible.length <= 3

  const cards = visible.map((b) => (
    <div key={b.id} className={styles.cardWrap}>
      <BusinessCard business={b} tone="purple" context="nearby" />
    </div>
  ))

  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}>
              <NavigationIcon size={22} />
            </span>
            <h2 className={styles.title}>قريب منك</h2>
          </div>

          <Link href="/nearby" className={styles.viewAll}>
            <span>شوف الكل</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </header>

        <div className={styles.neonLine} aria-hidden />

        {useGrid ? (
          <div className={styles.centeredGrid}>{cards}</div>
        ) : (
          <RowCarousel accent="#55E7D1">{cards}</RowCarousel>
        )}
      </div>
    </section>
  )
}
