'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Business } from '@/lib/data'
import FeaturedCard from './featured-card'
import { CrownGoldIcon, ArrowLeftIcon } from './icons'
import {
  FEATURED_ROTATION_MS,
  rotate,
} from '@/lib/featured-rotation'
import styles from './featured-bento.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Bento (Hero + 4 صغيرة + دوران عادل)
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
  initialStart: number
}

const VISIBLE_COUNT = 5

export default function FeaturedBento({ businesses, initialStart }: Props) {
  const [offset, setOffset] = useState(initialStart)

  useEffect(() => {
    if (businesses.length <= 1) return
    const timer = setInterval(() => {
      setOffset((o) => (o + 1) % businesses.length)
    }, FEATURED_ROTATION_MS)
    return () => clearInterval(timer)
  }, [businesses.length])

  if (businesses.length === 0) return null

  const rotated = rotate(businesses, offset)
  const visible = rotated.slice(0, VISIBLE_COUNT)
  const hero = visible[0]
  const smalls = visible.slice(1)

  return (
    <section className={`eah-section-bg ${styles.section}`}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}>
              <CrownGoldIcon size={22} />
            </span>
            <h2 className={styles.title}>المميزون</h2>
            <span className={styles.titleBadge}>Premium</span>
          </div>

          <Link href="/featured" className={styles.viewAll}>
            <span>شوف الكل</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </header>

        <div className={styles.neonLine} aria-hidden />

        <div className={styles.grid}>
          {hero && (
            <div className={styles.heroSlot}>
              <FeaturedCard business={hero} variant="hero" priority />
            </div>
          )}
          {smalls.map((b) => (
            <div key={b.id} className={styles.smallSlot}>
              <FeaturedCard business={b} variant="small" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
