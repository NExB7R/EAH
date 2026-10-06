'use client'

import { useState, useTransition } from 'react'
import { CheckIcon, CloseIcon, AlertIcon } from '@/components/icons'
import { approveAd, rejectAd, pauseAd, resumeAd, deleteAd } from './actions'
import type { AdminAd } from '@/lib/data/ads'
import styles from './ads.module.css'

type Props = {
  ads: AdminAd[]
}

const STATUS_LABEL: Record<AdminAd['status'], string> = {
  pending: 'بانتظار الموافقة',
  approved: 'معتمد',
  rejected: 'مرفوض',
  active: 'نشط',
  expired: 'منتهي',
  paused: 'متوقف',
}

const STATUS_TONE: Record<AdminAd['status'], string> = {
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

export default function AdsManager({ ads }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null)
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) setError(res.error ?? 'فشل')
    })
  }

  const handleApprove = (id: string) => {
    const formData = new FormData()
    run(() => approveAd(id, formData))
  }

  const handleReject = (id: string) => {
    const reason = prompt('سبب الرفض؟')
    if (reason === null) return
    run(() => rejectAd(id, reason))
  }

  const handlePause = (id: string) => run(() => pauseAd(id))
  const handleResume = (id: string) => run(() => resumeAd(id))

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`تأكيد حذف "${title}"؟`)) return
    run(() => deleteAd(id))
  }

  if (ads.length === 0) {
    return <p className={styles.emptyAds}>مفيش إعلانات لسه</p>
  }

  return (
    <div className={styles.adsList}>
      {error && <p className={styles.error}>{error}</p>}

      {ads.map((ad) => {
        const tone = STATUS_TONE[ad.status]

        return (
          <div key={ad.id} className={`${styles.adCard} ${pending ? styles.pending : ''}`}>
            <div className={styles.adHead}>
              <span className={styles.slotBadge}>{ad.slot_name}</span>
              <span className={`${styles.status} ${styles[tone]}`}>{STATUS_LABEL[ad.status]}</span>
              <span className={styles.price}>{0} ج.م</span>
            </div>

            <h3 className={styles.adTitle}>{ad.title}</h3>
            <p className={styles.adBiz}>
              {ad.business_name} — {formatDate(ad.created_at)}
            </p>

            {ad.image_url && (
              <p className={styles.adMeta}>
                <a href={ad.image_url} target="_blank" rel="noopener" className={styles.link}>
                  الصورة
                </a>
              </p>
            )}

            {ad.link_url && (
              <p className={styles.adMeta}>
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

            <div className={styles.adStats}>
              <span>ظهور: {ad.impressions}</span>
              <span>نقرات: {ad.clicks}</span>
            </div>

            <div className={styles.adActions}>
              {ad.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleApprove(ad.id)}
                    disabled={pending}
                    className={styles.okBtn}
                  >
                    <CheckIcon size={14} />
                    <span>موافقة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(ad.id)}
                    disabled={pending}
                    className={styles.dangerBtn}
                  >
                    <CloseIcon size={14} />
                    <span>رفض</span>
                  </button>
                </>
              )}

              {ad.status === 'active' && (
                <button
                  type="button"
                  onClick={() => handlePause(ad.id)}
                  disabled={pending}
                  className={styles.mutedBtn}
                >
                  <span>إيقاف</span>
                </button>
              )}

              {ad.status === 'paused' && (
                <button
                  type="button"
                  onClick={() => handleResume(ad.id)}
                  disabled={pending}
                  className={styles.okBtn}
                >
                  <span>استئناف</span>
                </button>
              )}

              {(ad.status === 'rejected' || ad.status === 'expired') && (
                <button
                  type="button"
                  onClick={() => handleDelete(ad.id, ad.title)}
                  disabled={pending}
                  className={styles.dangerBtn}
                >
                  <CloseIcon size={14} />
                  <span>حذف</span>
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
