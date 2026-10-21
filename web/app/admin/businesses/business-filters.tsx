'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { SearchIcon, CloseIcon, LocationIcon } from '@/components/icons'
import styles from './businesses.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business Filters (search + area)
// ═══════════════════════════════════════════════════════════

type Props = {
  areas: string[]
}

export default function BusinessFilters({ areas }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const previousQuery = useRef(q)
  const area = searchParams.get('area') ?? ''

  const isEditingQuery = useRef(false)

  useEffect(() => {
    const urlQuery = searchParams.get('q') ?? ''
    if (!isEditingQuery.current && urlQuery !== q) {
      previousQuery.current = urlQuery
      setQ(urlQuery)
      return
    }

    const queryChanged = previousQuery.current !== q
    previousQuery.current = q
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (q.trim()) params.set('q', q.trim())
      else params.delete('q')
      if (queryChanged) params.set('page', '1')
      const next = params.toString()
      if (next !== searchParams.toString()) {
        router.replace(`${pathname}?${next}`, { scroll: false })
      }
      isEditingQuery.current = false
    }, 350)
    return () => clearTimeout(t)
  }, [q, router, searchParams, pathname])

  const handleArea = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('area', value)
    else params.delete('area')
    params.set('page', '1')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className={styles.filterWrap}>
      <div className={styles.searchWrap}>
        <SearchIcon size={16} className={styles.searchIcon} />
        <input
          type="text"
          value={q}
          onChange={(e) => {
            isEditingQuery.current = true
            setQ(e.target.value)
          }}
          placeholder="ابحث بالاسم، المنطقة، صاحب النشاط أو الرقم..."
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

      <div className={styles.areaSelect}>
        <LocationIcon size={16} className={styles.searchIcon} />
        <select
          value={area}
          onChange={(e) => handleArea(e.target.value)}
          className={styles.select}
          aria-label="فلترة بالمنطقة"
        >
          <option value="">كل المناطق</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
