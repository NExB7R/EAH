'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SearchIcon, CloseIcon } from '@/components/icons'
import styles from './audit.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Audit Filters (search + action + actor)
// ═══════════════════════════════════════════════════════════

type Props = {
  actions: string[]
  actors: { id: string; name: string }[]
}

export default function AuditFilters({ actions, actors }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const actionFilter = searchParams.get('action') ?? ''
  const actorFilter = searchParams.get('actor') ?? ''

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

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const clearAll = () => {
    setQ('')
    router.replace(pathname, { scroll: false })
  }

  const hasFilters = q || actionFilter || actorFilter

  return (
    <div className={styles.filterWrap}>
      <div className={styles.searchWrap}>
        <SearchIcon size={16} className={styles.searchIcon} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث بالـ action، الاسم، النوع..."
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

      <select
        value={actionFilter}
        onChange={(e) => update('action', e.target.value)}
        className={styles.select}
        aria-label="فلترة بالـ action"
      >
        <option value="">كل الإجراءات</option>
        {actions.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <select
        value={actorFilter}
        onChange={(e) => update('actor', e.target.value)}
        className={styles.select}
        aria-label="فلترة بالأدمن"
      >
        <option value="">كل الأدمن</option>
        {actors.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button type="button" onClick={clearAll} className={styles.clearAll}>
          مسح الكل
        </button>
      )}
    </div>
  )
}
