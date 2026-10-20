'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { StoreIcon, CheckCircleIcon, CloseIcon, ArrowLeftIcon, AlertIcon, SparklesIcon } from '@/components/icons'
import { approveBusiness, rejectBusiness, archiveBusiness, republishBusiness } from './actions'
import type { PendingBusiness } from '@/lib/data/admin'
import styles from './businesses.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business Row (Admin)
// ═══════════════════════════════════════════════════════════

type Props = {
  business: PendingBusiness
  selected?: boolean
  onToggleSelect?: () => void
  showCheckbox?: boolean
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
  misc: 'أخرى',
}

function formatDate(iso: string): string {
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

export default function BusinessRow({
  business: b,
  selected = false,
  onToggleSelect,
  showCheckbox = false,
}: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showReject, setShowReject] = useState(false)

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null)
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) setError(res.error ?? 'فشل')
    })
  }

  const handleApprove = () => run(() => approveBusiness(b.id))
  const handleArchive = () => {
    if (!confirm(`إخفاء "${b.name}" من المنصة؟`)) return
    run(() => archiveBusiness(b.id))
  }
  const handleRepublish = () => run(() => republishBusiness(b.id))

  const handleReject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await rejectBusiness(b.id, formData)
      if (res.ok) {
        setShowReject(false)
      } else {
        setError(res.error)
      }
    })
  }

  const isRejected = !!b.rejected_at
  const status = b.is_published ? 'published' : isRejected ? 'rejected' : 'pending'

  return (
    <div
      className={`${styles.card} ${pending ? styles.pending : ''} ${selected ? styles.cardSelected : ''}`}
    >
      {showCheckbox && (
        <label className={styles.cardCheckbox}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`تحديد ${b.name}`}
          />
        </label>
      )}
      <div className={styles.imageWrap}>
        {b.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.cover_image_url} alt={b.name} className={styles.image} />
        ) : (
          <div className={styles.imageFallback}>
            <StoreIcon size={32} />
          </div>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.bodyHead}>
          <h3 className={styles.name}>{b.name}</h3>
          <div className={styles.badges}>
            <span className={`${styles.status} ${styles[`status_${status}`]}`}>
              {status === 'pending' && 'بانتظار'}
              {status === 'published' && 'منشور'}
              {status === 'rejected' && 'مرفوض'}
            </span>
            {b.business_type_status === 'pending' && (
              <span className={styles.status + ' ' + styles.status_pending}>نوع النشاط بحاجة موافقة</span>
            )}
            {b.business_type_status === 'rejected' && (
              <span className={styles.status + ' ' + styles.status_rejected}>نوع النشاط مرفوض</span>
            )}
            <span
              className={`${styles.sourceChip} ${b.source === 'admin' ? styles.sourceAdmin : ''}`}
            >
              {b.source === 'admin' ? 'بإدارة الأدمن' : 'بإدارة التاجر'}
            </span>
          </div>
        </div>

        <div className={styles.meta}>
          <span>{TYPE_LABEL[b.business_type] ?? b.business_type}</span>
          {b.area && (
            <>
              <span className={styles.dot}>·</span>
              <span>{b.area}</span>
            </>
          )}
          <span className={styles.dot}>·</span>
          <span>{formatDate(b.created_at)}</span>
        </div>

        {b.owner && (
          <div className={styles.owner}>
            <span>👤 {b.owner.display_name}</span>
            {b.owner.phone && <span className={styles.phone}>· {b.owner.phone}</span>}
          </div>
        )}

        {b.description && <p className={styles.desc}>{b.description.slice(0, 200)}</p>}

        {isRejected && b.rejection_reason && (
          <div className={styles.rejectionBox}>
            <AlertIcon size={14} />
            <span>سبب الرفض: {b.rejection_reason}</span>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {showReject ? (
          <form onSubmit={handleReject} className={styles.rejectForm}>
            <textarea
              name="reason"
              required
              minLength={5}
              maxLength={300}
              rows={2}
              placeholder="سبب الرفض (5-300 حرف)..."
              className={styles.rejectInput}
              dir="rtl"
            />
            <div className={styles.rejectActions}>
              <button type="submit" disabled={pending} className={styles.dangerBtn}>
                تأكيد الرفض
              </button>
              <button
                type="button"
                onClick={() => setShowReject(false)}
                disabled={pending}
                className={styles.cancelBtn}
              >
                إلغاء
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.actions}>
            {status === 'pending' && (
              <>
                {b.business_type_status === 'pending' ? (
                  <Link href="/admin/business-types" className={styles.viewBtn}>
                    <SparklesIcon size={14} />
                    <span>مراجعة نوع النشاط</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={pending}
                    className={styles.approveBtn}
                  >
                    <CheckCircleIcon size={14} />
                    <span>موافقة</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowReject(true)}
                  disabled={pending}
                  className={styles.dangerBtn}
                >
                  <CloseIcon size={14} />
                  <span>رفض</span>
                </button>
              </>
            )}

            {status === 'published' && (
              <button
                type="button"
                onClick={handleArchive}
                disabled={pending}
                className={styles.secondaryBtn}
              >
                <CloseIcon size={14} />
                <span>إخفاء مؤقت</span>
              </button>
            )}

            {status === 'rejected' && (
              b.business_type_status === 'pending' ? (
                <Link href="/admin/business-types" className={styles.viewBtn}>
                  <SparklesIcon size={14} />
                  <span>مراجعة نوع النشاط</span>
                </Link>
              ) : b.business_type_status === 'rejected' ? (
                <Link href={'/admin/businesses/' + b.id + '?tab=edit'} className={styles.viewBtn}>
                  <SparklesIcon size={14} />
                  <span>تصحيح نوع النشاط</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleRepublish}
                  disabled={pending}
                  className={styles.approveBtn}
                >
                  <CheckCircleIcon size={14} />
                  <span>إعادة نشر</span>
                </button>
              )
            )}

            <Link href={`/admin/businesses/${b.id}`} className={styles.viewBtn}>
              <span>تفاصيل</span>
              <ArrowLeftIcon size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
