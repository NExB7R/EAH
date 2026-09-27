'use client'

import type { Business } from '@/lib/data'
import FeaturedCard from '@/components/featured-card'
import { useFairRotation } from '@/lib/hooks/use-fair-rotation'
import styles from './featured.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Showcase (/featured)
//   • نفس منطق Home (Fisher-Yates + sessionStorage)
//   • 8/6/4 حسب الشاشة
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
}

const PAGE_SIZES = { mobile: 4, tablet: 6, desktop: 8 }
const INTERVAL_MS = 5000

export default function FeaturedShowcase({ businesses }: Props) {
  const { visible, containerRef, setPaused } = useFairRotation<Business>({
    items: businesses,
    pageSizes: PAGE_SIZES,
    intervalMs: INTERVAL_MS,
    storageKey: 'eah:featured:page',
  })

  if (businesses.length === 0) return null

  const cycleKey = visible.map((b) => b.id).join(',')

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>}>
      <div
        key={cycleKey}
        className={styles.grid}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {visible.map((b) => (
          <FeaturedCard key={b.id} business={b} variant="small" />
        ))}
      </div>
    </div>
  )
}
