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

  const activeKey = searchParams.get('chip') ?? 'all'

  function handleChip(key: string, action: { type: string; value: string }) {
    const params = new URLSearchParams(searchParams.toString())

    // نظّف scroll القديم دايماً
    params.delete('scroll')

    if (key === 'all') {
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
              <chip.Icon size={16} />
              <span>{chip.label}</span>
            </button>
          )
        })}

        <Link href={EXPLORE_CHIP.href} className={`${styles.chip} ${styles.special}`}>
          <EXPLORE_CHIP.Icon size={16} />
          <span>{EXPLORE_CHIP.label}</span>
        </Link>
      </div>
    </div>
  )
}
