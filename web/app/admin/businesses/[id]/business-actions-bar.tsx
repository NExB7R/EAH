'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircleIcon,
  CloseIcon,
  ArrowLeftIcon,
  AlertIcon,
  ExternalLinkIcon,
} from '@/components/icons'
import { approveBusiness, rejectBusiness, archiveBusiness, republishBusiness } from '../actions'
import styles from '../businesses.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business Quick Actions (Detail Page)
// ═══════════════════════════════════════════════════════════

type Props = {
  businessId: string
  businessName: string
  businessSlug: string
  isPublished: boolean
  isRejected: boolean
}

export default function BusinessActionsBar({
  businessId,
  businessName,
  businessSlug,
  isPublished,
  isRejected,
}: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showReject, setShowReject] = useState(false)
  const router = useRouter()

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null)
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        router.refresh()
      } else {
        setError(res.error ?? 'فشل')
      }
    })
  }

  const handleApprove = () => run(() => approveBusiness(businessId))
  const handleArchive = () => {
    if (!confirm(`إخفاء "${businessName}" من المنصة؟`)) return
    run(() => archiveBusiness(businessId))
  }
  const handleRepublish = () => run(() => republishBusiness(businessId))

  const handleReject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await rejectBusiness(businessId, formData)
      if (res.ok) {
        setShowReject(false)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  const status = isPublished ? 'published' : isRejected ? 'rejected' : 'pending'

  return (
    <div className={styles.actionsBar}>
      {error && (
        <div className={styles.actionsBarError}>
          <AlertIcon size={14} />
          <span>{error}</span>
        </div>
      )}

      {showReject && (
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
      )}

      {!showReject && (
        <div className={styles.actionsRow}>
          {status === 'pending' && (
            <>
              <button
                type="button"
                onClick={handleApprove}
                disabled={pending}
                className={styles.approveBtn}
              >
                <CheckCircleIcon size={14} />
                <span>موافقة</span>
              </button>
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
            <button
              type="button"
              onClick={handleRepublish}
              disabled={pending}
              className={styles.approveBtn}
            >
              <CheckCircleIcon size={14} />
              <span>إعادة نشر</span>
            </button>
          )}

          {isPublished ? (
            <Link
              href={`/businesses/${businessSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryBtn}
            >
              <ExternalLinkIcon size={14} />
              <span>معاينة على الموقع</span>
            </Link>
          ) : (
            <span className={styles.secondaryBtn} aria-label="النشاط غير منشور بعد">
              <AlertIcon size={14} />
              <span>الصفحة العامة تظهر بعد النشر</span>
            </span>
          )}

          <Link href="/admin/businesses" className={styles.secondaryBtn}>
            <ArrowLeftIcon size={14} />
            <span>رجوع للقائمة</span>
          </Link>
        </div>
      )}
    </div>
  )
}
