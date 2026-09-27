'use client'

import Link from 'next/link'
import type { Business } from '@/lib/data'
import FeaturedCard from './featured-card'
import { CrownGoldIcon, ArrowLeftIcon } from './icons'
import styles from './featured-bento.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Bento (بدون hero — كروت موحّدة)
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
  initialStart: number
}

const VISIBLE_COUNT = 10

export default function FeaturedBento({ businesses }: Props) {
  if (businesses.length === 0) return null

  const visible = businesses.slice(0, VISIBLE_COUNT)

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

        <div className={styles.neonLine} aria-hidden />

        <div className={styles.grid}>
          {visible.map((b, i) => (
            <FeaturedCard key={b.id} business={b} variant="small" priority={i < 4} />
          ))}
        </div>
      </div>
    </section>
  )
}
