'use client'

import { useState, useTransition } from 'react'
import { TagIcon, CloseIcon, CheckIcon, AlertIcon } from '@/components/icons'
import { cancelMyAd } from './actions'
import type { AdRow } from './types'
import styles from './ads.module.css'

type Props = {
  ads: AdRow[]
}

const STATUS_LABEL: Record<AdRow['status'], string> = {
  pending: 'بانتظار الموافقة',
  approved: 'معتمد',
  rejected: 'مرفوض',
  active: 'نشط',
  expired: 'منتهي',
  paused: 'متوقف',
}

const STATUS_TONE: Record<AdRow['status'], string> = {
  pending: 'warning',
  approved: 'ok',
  rejected: 'danger',
  active: 'ok',
  expired: 'muted',
  paused: 'muted',
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

export default function AdsList({ ads }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleCancel = (id: string, title: string) => {
    if (!confirm(`تأكيد حذف إعلان "${title}"؟`)) return
    setError(null)
    startTransition(async () => {
      const res = await cancelMyAd(id)
      if (!res.ok) setError(res.error)
    })
  }

  if (ads.length === 0) return null

  return (
    <div className={styles.list}>
      {error && <p className={styles.error}>{error}</p>}

      {ads.map((ad) => {
        const tone = STATUS_TONE[ad.status]
        const canCancel = ad.status === 'pending' || ad.status === 'rejected'

        return (
          <div key={ad.id} className={`${styles.card} ${pending ? styles.pending : ''}`}>
            <div className={styles.cardHead}>
              <span className={styles.slotBadge}>
                <TagIcon size={12} />
                {ad.slot_name}
              </span>
              <span className={`${styles.status} ${styles[tone]}`}>
                {ad.status === 'pending' && <AlertIcon size={11} />}
                {ad.status === 'active' && <CheckIcon size={11} />}
                {STATUS_LABEL[ad.status]}
              </span>
            </div>

            <h3 className={styles.cardTitle}>{ad.title}</h3>

            {ad.image_url && (
              <p className={styles.cardMeta}>
                <a href={ad.image_url} target="_blank" rel="noopener" className={styles.link}>
                  عرض الصورة
                </a>
              </p>
            )}

            {ad.link_url && (
              <p className={styles.cardMeta}>
                <a href={ad.link_url} target="_blank" rel="noopener" className={styles.link}>
                  {ad.link_url}
                </a>
              </p>
            )}

            {ad.rejected_reason && (
              <p className={styles.rejection}>
                <AlertIcon size={14} />
                {ad.rejected_reason}
              </p>
            )}

            <div className={styles.stats}>
              <span className={styles.stat}>
                <span className={styles.statLabel}>ظهور</span>
                <span className={styles.statValue}>{ad.impressions}</span>
              </span>
              <span className={styles.stat}>
                <span className={styles.statLabel}>نقرات</span>
                <span className={styles.statValue}>{ad.clicks}</span>
              </span>
              <span className={styles.stat}>
                <span className={styles.statLabel}>تاريخ</span>
                <span className={styles.statValue}>{formatDate(ad.created_at)}</span>
              </span>
            </div>

            {(ad.starts_at || ad.ends_at) && (
              <p className={styles.dates}>
                {ad.starts_at && <>من {formatDate(ad.starts_at)} </>}
                {ad.ends_at && <>لـ {formatDate(ad.ends_at)}</>}
              </p>
            )}

            {canCancel && (
              <div className={styles.cardActions}>
                <button
                  type="button"
                  onClick={() => handleCancel(ad.id, ad.title)}
                  disabled={pending}
                  className={styles.dangerBtn}
                >
                  <CloseIcon size={14} />
                  <span>حذف الطلب</span>
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
