'use client'

import { useState } from 'react'
import BusinessCard from './business-card'
import type { CardTone } from './business-card'
import type { Business } from '@/lib/data'
import styles from './section-layout.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Load More Grid (client only)
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
  tone: CardTone
  pageSize?: number
}

export default function LoadMoreGrid({
  businesses,
  tone,
  pageSize = 10,
}: Props) {
  const [page, setPage] = useState(1)
  const totalCount = businesses.length
  const endIdx = page * pageSize
  const hasMore = endIdx < totalCount
  const visible = businesses.slice(0, endIdx)

  return (
    <>
      <div className={styles.grid}>
        {visible.map((b) => (
          <BusinessCard key={b.id} business={b} tone={tone} />
        ))}
      </div>

      {hasMore && (
        <div className={styles.loadMoreWrap}>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className={styles.loadMore}
          >
            شوف المزيد
          </button>
          <span className={styles.counter}>
            بتشوف {visible.length} من {totalCount}
          </span>
        </div>
      )}
    </>
  )
}
