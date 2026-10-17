'use client'

import { useMemo, useState, useTransition } from 'react'
import { TagIcon, CloseIcon, CheckIcon, AlertIcon } from '@/components/icons'
import { cancelMyAd } from './actions'
import type { AdRow } from './types'
import styles from './ads.module.css'

type Props = {
  ads: AdRow[]
}

const STATUS_LABEL: Record<AdRow['status'], string> = {
  pending: 'بانتظار الموافقة',
  rejected: 'مرفوض',
  active: 'نشط',
  expired: 'منتهي',
  paused: 'متوقف',
}

const STATUS_TONE: Record<AdRow['status'], string> = {
  pending: 'warning',
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
  const [filter, setFilter] = useState<string>('all')
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())

  const visible = ads.filter((a) => !removedIds.has(a.id))

  const stats = useMemo(() => {
    let pendingN = 0
    let activeN = 0
    let rejectedN = 0
    let expiredN = 0
    for (const a of visible) {
      if (a.status === 'pending') pendingN++
      else if (a.status === 'active') activeN++
      else if (a.status === 'rejected') rejectedN++
      else if (a.status === 'expired') expiredN++
    }
    return {
      total: visible.length,
      pending: pendingN,
      active: activeN,
      rejected: rejectedN,
      expired: expiredN,
    }
  }, [visible])

  const filtered = useMemo(() => {
    if (filter === 'all') return visible
    return visible.filter((a) => a.status === filter)
  }, [visible, filter])

  const handleCancel = (id: string, title: string) => {
    if (!confirm(`تأكيد حذف إعلان "${title}"؟`)) return
    setError(null)
    setRemovedIds((prev) => new Set([...prev, id]))
    startTransition(async () => {
      const res = await cancelMyAd(id)
      if (!res.ok) {
        setRemovedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        setError(res.error)
      }
    })
  }

  if (ads.length === 0) return null

  return (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>إجمالي</span>
        </div>
        <div className={`${styles.statCard} ${stats.pending > 0 ? styles.statWarn : ''}`}>
          <span className={styles.statValue}>{stats.pending}</span>
          <span className={styles.statLabel}>بانتظار</span>
        </div>
        <div className={`${styles.statCard} ${styles.statOk}`}>
          <span className={styles.statValue}>{stats.active}</span>
          <span className={styles.statLabel}>نشط</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.expired}</span>
          <span className={styles.statLabel}>منتهي</span>
        </div>
      </div>

      <div className={styles.filterTabs}>
        {[
          { key: 'all', label: 'الكل', count: stats.total },
          { key: 'pending', label: 'بانتظار', count: stats.pending },
          { key: 'active', label: 'نشط', count: stats.active },
          { key: 'rejected', label: 'مرفوض', count: stats.rejected },
          { key: 'expired', label: 'منتهي', count: stats.expired },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`${styles.filterTab} ${filter === f.key ? styles.filterTabActive : ''}`}
          >
            {f.label} <span className={styles.filterCount}>{f.count}</span>
          </button>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {filtered.length === 0 ? (
        <p className={styles.emptyFiltered}>مفيش إعلانات في الفئة دي</p>
      ) : (
        <div className={styles.list}>
          {filtered.map((ad) => {
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
      )}
    </>
  )
}
