'use client'

import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SearchIcon, CloseIcon } from '@/components/icons'
import styles from './moderation.module.css'

const STATUS_TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'بانتظار' },
  { key: 'flagged', label: 'مُعلّم' },
  { key: 'low_rating', label: 'تقييم منخفض' },
] as const

export default function ModerationFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const current = searchParams.get('filter') ?? 'all'

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (q.trim()) params.set('q', q.trim())
      else params.delete('q')
      const next = params.toString()
      if (next !== searchParams.toString()) {
        router.replace(`${pathname}?${next}`, { scroll: false })
      }
    }, 350)
    return () => clearTimeout(t)
  }, [q, router, searchParams, pathname])

  const hasFilters = q || current !== 'all'

  const clearAll = () => {
    setQ('')
    router.replace(pathname, { scroll: false })
  }

  return (
    <div className={styles.filterWrap}>
      <nav className={styles.tabs} aria-label="تصفية المراجعات">
        {STATUS_TABS.map((t) => {
          const active = t.key === current
          const params = new URLSearchParams(searchParams.toString())
          if (t.key === 'all') params.delete('filter')
          else params.set('filter', t.key)
          const href = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
          return (
            <Link
              key={t.key}
              href={href}
              className={`${styles.filterTab} ${active ? styles.filterTabActive : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>

      <div className={styles.searchWrap}>
        <SearchIcon size={16} className={styles.searchIcon} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث بالتعليق، اسم النشاط، أو اسم المستخدم..."
          className={styles.searchInput}
          dir="rtl"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            className={styles.searchClear}
            aria-label="مسح البحث"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      {hasFilters && (
        <button type="button" onClick={clearAll} className={styles.clearAll}>
          مسح الكل
        </button>
      )}
    </div>
  )
}
