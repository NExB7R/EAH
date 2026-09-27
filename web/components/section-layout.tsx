'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ComponentType } from 'react'
import SecondaryHero from './secondary-hero'
import BusinessCard from './business-card'
import type { CardTone } from './business-card'
import SectionBadge from './section-badge'
import type { BadgeVariant } from './section-badge'
import type { SectionTone } from './section-title'
import { TargetIcon } from './icons'
import type { Business } from '@/lib/data'
import styles from './section-layout.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Section Layout (shared for all section pages)
// ═══════════════════════════════════════════════════════════

type IconComp = ComponentType<{ size?: number; className?: string }>

type Props = {
  activeKey: string
  title: string
  Icon: IconComp
  tone: SectionTone
  badgeVariant: BadgeVariant
  badgeLabel: string
  businesses: Business[]
  pageSize?: number
}

const PAGE_SIZE = 12

export default function SectionLayout({
  activeKey,
  title,
  Icon,
  tone,
  badgeVariant,
  badgeLabel,
  businesses,
  pageSize = PAGE_SIZE,
}: Props) {
  const [page, setPage] = useState(1)

  const totalCount = businesses.length
  const endIdx = page * pageSize
  const hasMore = endIdx < totalCount
  const visible = businesses.slice(0, endIdx)

  const cardTone: CardTone = (
    tone === 'gold'
      ? 'gold'
      : tone === 'orange'
      ? 'orange'
      : tone === 'teal'
      ? 'teal'
      : tone === 'pink'
      ? 'pink'
      : tone === 'blue'
      ? 'blue'
      : 'purple'
  )

  return (
    <main className={styles.page}>
      <SecondaryHero
        activeKey={activeKey}
        title={title}
        Icon={Icon}
        tone={tone}
        count={totalCount}
      />

      <div className={styles.content}>
        <div className={styles.badgeRow}>
          <SectionBadge
            variant={badgeVariant}
            label={badgeLabel}
            size="md"
          />
        </div>

        {visible.length > 0 ? (
          <>
            <div className={styles.grid}>
              {visible.map((b) => (
                <BusinessCard key={b.id} business={b} tone={cardTone} />
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
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <TargetIcon size={44} />
            </div>
            <h2 className={styles.emptyTitle}>لسه مفيش حاجة هنا</h2>
            <p className={styles.emptyText}>
              هنضيف قريب إن شاء الله.
            </p>
            <Link href="/explore" className={styles.emptyBtn}>
              اكتشف كل حاجة
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
