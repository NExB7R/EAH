'use client'

import { useEffect, useState } from 'react'
import type { Business } from '@/lib/data'
import FeaturedCard from '@/components/featured-card'
import {
  FEATURED_ROTATION_MS,
  rotate,
} from '@/lib/featured-rotation'
import styles from './featured.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Showcase (Hero داير + شبكة الكل)
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
  initialStart: number
}

export default function FeaturedShowcase({ businesses, initialStart }: Props) {
  const [offset, setOffset] = useState(initialStart)

  useEffect(() => {
    if (businesses.length <= 1) return
    const timer = setInterval(() => {
      setOffset((o) => (o + 1) % businesses.length)
    }, FEATURED_ROTATION_MS)
    return () => clearInterval(timer)
  }, [businesses.length])

  const rotated = rotate(businesses, offset)
  const hero = rotated[0]
  const rest = rotated.slice(1)

  return (
    <>
      {hero && (
        <div className={styles.heroWrap}>
          <FeaturedCard business={hero} variant="hero" priority />
        </div>
      )}

      <div className={styles.neonLine} aria-hidden />

      <div className={styles.grid}>
        {rest.map((b) => (
          <FeaturedCard key={b.id} business={b} variant="small" />
        ))}
      </div>
    </>
  )
}
