'use client'

import { useMemo, useState } from 'react'
import { SearchIcon, CloseIcon } from '@/components/icons'
import BranchRow from './branch-row'
import type { BranchRow as BranchRowType } from './types'
import styles from './branches.module.css'

type Props = {
  branches: BranchRowType[]
}

type FilterKey = 'all' | 'active' | 'inactive'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'active', label: 'نشط' },
  { key: 'inactive', label: 'موقوف' },
]

export default function BranchesList({ branches }: Props) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())

  const visible = branches.filter((b) => !removedIds.has(b.id))

  const stats = useMemo(() => {
    let active = 0
    let inactive = 0
    let primary = 0
    for (const b of visible) {
      if (b.is_active) active++
      else inactive++
      if (b.is_primary) primary++
    }
    return { total: visible.length, active, inactive, primary }
  }, [visible])

  const filtered = useMemo(() => {
    let result = visible
    if (filter === 'active') result = result.filter((b) => b.is_active)
    else if (filter === 'inactive') result = result.filter((b) => !b.is_active)

    const query = q.trim().toLowerCase()
    if (query) {
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.area.toLowerCase().includes(query) ||
          (b.address_text ?? '').toLowerCase().includes(query),
      )
    }
    return result
  }, [visible, filter, q])

  const handleDeleteStart = (id: string) => {
    setRemovedIds((prev) => new Set([...prev, id]))
  }

  const handleDeleteFail = (id: string) => {
    setRemovedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>إجمالي</span>
        </div>
        <div className={`${styles.statCard} ${styles.statOk}`}>
          <span className={styles.statValue}>{stats.active}</span>
          <span className={styles.statLabel}>نشط</span>
        </div>
        <div className={`${styles.statCard} ${stats.inactive > 0 ? styles.statWarn : ''}`}>
          <span className={styles.statValue}>{stats.inactive}</span>
          <span className={styles.statLabel}>موقوف</span>
        </div>
        <div className={`${styles.statCard} ${styles.statGold}`}>
          <span className={styles.statValue}>{stats.primary}</span>
          <span className={styles.statLabel}>أساسي</span>
        </div>
      </div>

      <div className={styles.searchWrap}>
        <SearchIcon size={16} className={styles.searchIcon} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث باسم الفرع أو المنطقة..."
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

      <div className={styles.filterTabs}>
        {FILTERS.map((f) => {
          const count =
            f.key === 'all' ? stats.total : f.key === 'active' ? stats.active : stats.inactive
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`${styles.filterTab} ${filter === f.key ? styles.filterTabActive : ''}`}
            >
              {f.label} <span className={styles.filterCount}>{count}</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyFiltered}>
          <p>مفيش فروع مطابقة</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((b) => (
            <BranchRow
              key={b.id}
              branch={b}
              onDeleteStart={handleDeleteStart}
              onDeleteFail={handleDeleteFail}
            />
          ))}
        </div>
      )}
    </>
  )
}
