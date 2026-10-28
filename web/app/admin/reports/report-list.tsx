'use client'

import { useState } from 'react'
import { TargetIcon } from '@/components/icons'
import ReportRow from './report-row'
import styles from './reports.module.css'

type Report = {
  id: string
  entity_type: string
  entity_id: string | null
  reason: string
  note: string | null
  status: string
  admin_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  reporter: { display_name: string } | null
}

type Props = {
  reports: Report[]
}

const FILTERS = [
  { key: 'pending', label: 'مفتوح' },
  { key: 'reviewing', label: 'قيد المراجعة' },
  { key: 'resolved', label: 'مثبتة' },
  { key: 'dismissed', label: 'غير مثبتة' },
  { key: 'all', label: 'الكل' },
] as const

export default function ReportList({ reports }: Props) {
  const [filter, setFilter] = useState<string>('pending')

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.status === filter)

  if (reports.length === 0) {
    return (
      <div className={styles.empty}>
        <TargetIcon size={32} />
        <p>مفيش إبلاغات</p>
      </div>
    )
  }

  return (
    <>
      <div className={styles.filters}>
        {FILTERS.map((f) => {
          const count =
            f.key === 'all' ? reports.length : reports.filter((r) => r.status === f.key).length
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
            >
              {f.label} <span className={styles.filterCount}>{count}</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>مفيش إبلاغات في الفئة دي</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((r) => (
            <ReportRow key={r.id} report={r} />
          ))}
        </div>
      )}
    </>
  )
}
