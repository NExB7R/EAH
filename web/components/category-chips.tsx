'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CHIPS, EXPLORE_CHIP } from '@/lib/chips-config'
import styles from './category-chips.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Category Chips (Pyramid, 2026)
// 9 chips في صفوف + استكشف الكل في القمة
// ═══════════════════════════════════════════════════════════

export default function CategoryChips() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeKey = searchParams.get('chip') ?? ''

  function handleChip(key: string, action: { type: string; value: string }) {
    if (activeKey === key && action.type === 'filter') {
      router.push(`/explore?type=${action.value}`)
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.delete('scroll')

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
    <div className={styles.wrap} data-pending={isPending} aria-label="تصفية سريعة">
      <div className={styles.chips}>
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
              <span className={styles.chipIcon}>
                <chip.Icon size={15} />
              </span>
              <span>{chip.label}</span>
            </button>
          )
        })}
      </div>
      <Link href={EXPLORE_CHIP.href} className={`${styles.chip} ${styles.gold}`}>
        <span className={styles.chipIcon}>
          <EXPLORE_CHIP.Icon size={15} />
        </span>
        <span>{EXPLORE_CHIP.label}</span>
      </Link>
    </div>
  )
}
