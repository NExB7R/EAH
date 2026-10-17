'use client'

import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SearchIcon, CloseIcon } from '@/components/icons'
import styles from './health.module.css'

const SEVERITY_TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'critical', label: 'حرج' },
  { key: 'high', label: 'عالي' },
  { key: 'medium', label: 'متوسط' },
  { key: 'low', label: 'منخفض' },
] as const

const RESOLVED_TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'unresolved', label: 'غير محلول' },
  { key: 'resolved', label: 'محلول' },
] as const

export default function HealthFilters() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [q, setQ] = useState(sp.get('q') ?? '')
  const curSev = sp.get('severity') ?? 'all'
  const curRes = sp.get('resolved') ?? 'all'

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(sp.toString())
      if (q.trim()) params.set('q', q.trim())
      else params.delete('q')
      const next = params.toString()
      if (next !== sp.toString()) {
        router.replace(`${pathname}?${next}`, { scroll: false })
      }
    }, 350)
    return () => clearTimeout(t)
  }, [q, router, sp, pathname])

  const buildHref = (key: 'severity' | 'resolved', value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value === 'all') params.delete(key)
    else params.set(key, value)
    return `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
  }

  return (
    <div className={styles.filterWrap}>
      <nav className={styles.filterGroup} aria-label="الخطورة">
        {SEVERITY_TABS.map((t) => {
          const active = t.key === curSev
          return (
            <Link
              key={t.key}
              href={buildHref('severity', t.key)}
              className={`${styles.filterTab} ${active ? styles.filterTabActive : ''}`}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>

      <nav className={styles.filterGroup} aria-label="الحالة">
        {RESOLVED_TABS.map((t) => {
          const active = t.key === curRes
          return (
            <Link
              key={t.key}
              href={buildHref('resolved', t.key)}
              className={`${styles.filterTab} ${active ? styles.filterTabActive : ''}`}
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
          placeholder="ابحث في الرسالة / المصدر / المسار..."
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
