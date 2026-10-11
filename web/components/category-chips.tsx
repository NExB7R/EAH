'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CHIPS, EXPLORE_CHIP } from '@/lib/chips-config'
import styles from './category-chips.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Category Chips (Horizontal Snap Scroll)
// ═══════════════════════════════════════════════════════════

export default function CategoryChips() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeKey = searchParams.get('chip') ?? ''

  function handleChip(key: string, action: { type: string; value: string }) {
    // Double-tap على نفس الـ chip → Explore
    if (activeKey === key && action.type === 'filter') {
      router.push(`/explore?type=${action.value}`)
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.delete('scroll')

    // لو نفس الـ chip مفعّل → الغيه (يرجع للوضع الافتراضي)
    if (activeKey === key) {
      params.delete('chip')
      params.delete('type')
    } else {
      params.set('chip', key)
      if (action.type === 'filter') {
        params.set('type', action.value)
      } else {
        params.set('scroll', action.value)
      }
    }

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div className={styles.wrap} aria-label="تصفية سريعة">
      <div className={styles.scroller} data-pending={isPending}>
        {CHIPS.map((chip) => {
          const active = activeKey === chip.key
          return (
            <button
              key={chip.key}
              type="button"
              className={`${styles.chip} ${styles[chip.tone]} ${active ? styles.active : ''}`}
              onClick={() => handleChip(chip.key, chip.action)}
              aria-pressed={active}
            >
              <span className={styles.chipIcon} style={{ color: chip.iconColor }}>
                <chip.Icon size={16} />
              </span>
              <span>{chip.label}</span>
            </button>
          )
        })}

        <Link href={EXPLORE_CHIP.href} className={`${styles.chip} ${styles.special}`}>
          <span className={styles.chipIcon} style={{ color: EXPLORE_CHIP.iconColor }}>
            <EXPLORE_CHIP.Icon size={16} />
          </span>
          <span>{EXPLORE_CHIP.label}</span>
        </Link>
      </div>
    </div>
  )
}
