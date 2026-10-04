'use client'

import { useTransition } from 'react'
import { CloseIcon, CheckIcon } from '@/components/icons'
import { toggleAnnouncement, deleteAnnouncement } from './actions'
import type { AnnouncementRow as Row } from './types'
import styles from './announcements.module.css'

type Props = {
  row: Row
}

const THEME_LABEL: Record<Row['theme'], string> = {
  gold: 'ذهبي',
  purple: 'بنفسجي',
  orange: 'برتقالي',
  teal: 'تركواز',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

export default function AnnouncementRow({ row }: Props) {
  const [pending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await toggleAnnouncement(row.id, !row.is_active)
    })
  }

  const handleDelete = () => {
    if (!confirm(`تأكيد حذف: "${row.title}"؟`)) return
    startTransition(async () => {
      await deleteAnnouncement(row.id)
    })
  }

  return (
    <div
      className={`${styles.row} ${styles[`theme_${row.theme}`]} ${pending ? styles.pending : ''}`}
    >
      <div className={styles.rowHeader}>
        <span
          className={`${styles.status} ${row.is_active ? styles.statusActive : styles.statusInactive}`}
        >
          {row.is_active ? 'نشط' : 'موقوف'}
        </span>
        <span className={styles.themeBadge}>{THEME_LABEL[row.theme]}</span>
        <span className={styles.date}>{formatDate(row.created_at)}</span>
      </div>

      <h3 className={styles.rowTitle}>{row.title}</h3>
      {row.body && <p className={styles.rowBody}>{row.body}</p>}

      {row.link_url && row.link_label && (
        <p className={styles.rowLink}>
          زر: {row.link_label} → {row.link_url}
        </p>
      )}

      {(row.starts_at || row.ends_at) && (
        <p className={styles.rowSchedule}>
          {row.starts_at && <>من {formatDate(row.starts_at)} </>}
          {row.ends_at && <>لـ {formatDate(row.ends_at)}</>}
        </p>
      )}

      <div className={styles.rowActions}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          className={styles.toggleBtn}
        >
          {row.is_active ? (
            <>
              <CloseIcon size={14} />
              <span>إيقاف</span>
            </>
          ) : (
            <>
              <CheckIcon size={14} />
              <span>تنشيط</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className={styles.deleteBtn}
          aria-label="حذف"
        >
          <CloseIcon size={14} />
        </button>
      </div>
    </div>
  )
}
