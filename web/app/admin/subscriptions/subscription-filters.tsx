'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SearchIcon, CloseIcon } from '@/components/icons'
import styles from './subscriptions.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Subscription Filters (status tabs + search)
// ═══════════════════════════════════════════════════════════

const TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'بانتظار' },
  { key: 'active', label: 'نشط' },
  { key: 'trial', label: 'تجربة' },
  { key: 'expired', label: 'منتهي' },
  { key: 'cancelled', label: 'ملغي' },
] as const

export default function SubscriptionFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const current = searchParams.get('status') ?? 'all'
  const [q, setQ] = useState(searchParams.get('q') ?? '')

  // debounce البحث
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (q.trim()) params.set('q', q.trim())
      else params.delete('q')
      const next = params.toString()
      if (next !== searchParams.toString()) {
        router.replace(`/admin/subscriptions?${next}`, { scroll: false })
      }
    }, 350)
    return () => clearTimeout(t)
  }, [q, router, searchParams])

  return (
    <div className={styles.filterWrap}>
      <nav className={styles.tabs} aria-label="تصفية الاشتراكات">
        {TABS.map((t) => {
          const active = t.key === current
          const params = new URLSearchParams(searchParams.toString())
          if (t.key === 'all') params.delete('status')
          else params.set('status', t.key)
          const href = `/admin/subscriptions${params.toString() ? `?${params.toString()}` : ''}`
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
