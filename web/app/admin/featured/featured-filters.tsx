'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SearchIcon, CloseIcon } from '@/components/icons'
import styles from './featured.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Filters (filter tabs + search)
// ═══════════════════════════════════════════════════════════

const TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'pinned', label: 'مثبّت' },
  { key: 'expiring', label: 'تنتهي قريب' },
] as const

export default function FeaturedFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const current = searchParams.get('filter') ?? 'all'
  const [q, setQ] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (q.trim()) params.set('q', q.trim())
      else params.delete('q')
      const next = params.toString()
      if (next !== searchParams.toString()) {
        router.replace(`/admin/featured?${next}`, { scroll: false })
      }
    }, 350)
    return () => clearTimeout(t)
  }, [q, router, searchParams])

  return (
    <div className={styles.filterGroup}>
      <nav className={styles.tabs} aria-label="تصفية المميزين">
        {TABS.map((t) => {
          const active = t.key === current
          const params = new URLSearchParams(searchParams.toString())
          if (t.key === 'all') params.delete('filter')
          else params.set('filter', t.key)
          const href = `/admin/featured${params.toString() ? `?${params.toString()}` : ''}`
          return (
            <Link
              key={t.key}
              href={href}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
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
          placeholder="ابحث باسم النشاط..."
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
    </div>
  )
}
