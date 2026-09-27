'use client'

import type { Business } from '@/lib/data'
import FeaturedCard from '@/components/featured-card'
import styles from './featured.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Showcase (كل الكروت بنفس الحجم)
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
}

export default function FeaturedShowcase({ businesses }: Props) {
  if (businesses.length === 0) return null

  return (
    <div className={styles.grid}>
      {businesses.map((b, i) => (
        <FeaturedCard key={b.id} business={b} variant="small" priority={i < 8} />
      ))}
    </div>
  )
}
