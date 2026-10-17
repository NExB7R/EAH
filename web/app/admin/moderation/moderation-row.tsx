'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  StarIcon,
  CheckCircleIcon,
  CloseIcon,
  AlertIcon,
  UserIcon,
  StoreIcon,
} from '@/components/icons'
import { approveReview, rejectReview, deleteReview } from './actions'
import type { ModerationReview } from './types'
import styles from './moderation.module.css'

type Props = {
  review: ModerationReview
}

export default function ModerationRow({ review: r }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<null | 'reject' | 'delete'>(null)
  const [hidden, setHidden] = useState(false)
  const router = useRouter()

  const date = new Date(r.created_at).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, onDone?: () => void) => {
    setError(null)
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        setHidden(true)
        onDone?.()
        router.refresh()
      } else {
        setError(res.error ?? 'فشل')
      }
    })
  }

  const handleApprove = () => run(() => approveReview(r.id))

  const handleRejectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    run(
      () => rejectReview(r.id, fd),
      () => setModal(null),
    )
  }

  const handleDelete = () =>
    run(
      () => deleteReview(r.id),
      () => setModal(null),
    )

  if (hidden) return null

  return (
    <div className={`${styles.card} ${pending ? styles.pending : ''}`}>
      <div className={styles.head}>
        <div className={styles.from}>
          <span className={styles.userIcon}>
            <UserIcon size={14} />
          </span>
          <span className={styles.user}>{r.user_name ?? 'مستخدم'}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.businessIcon}>
            <StoreIcon size={12} />
          </span>
          {r.business_slug ? (
            <Link href={`/businesses/${r.business_slug}`} className={styles.business}>
              {r.business_name ?? 'نشاط'}
            </Link>
          ) : (
            <span className={styles.business}>{r.business_name ?? 'نشاط'}</span>
          )}
        </div>
        <span
          className={`${styles.badge} ${r.status === 'flagged' ? styles.flagged : styles.pending}`}
        >
          {r.status === 'flagged' ? 'مبلَّغ عنه' : 'معلّق'}
        </span>
      </div>

      {r.rating > 0 && (
        <div className={styles.rating}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < r.rating ? styles.starFilled : styles.starEmpty}>
              <StarIcon size={13} />
            </span>
          ))}
        </div>
      )}

      {r.flagged_reason && (
        <div className={styles.reasonBox}>
          <AlertIcon size={14} />
          <span>
            <strong>سبب الإبلاغ:</strong> {r.flagged_reason}
          </span>
        </div>
      )}

      {r.comment && <p className={styles.comment}>{r.comment}</p>}

      {error && (
        <div className={styles.error}>
          <AlertIcon size={14} />
          <span>{error}</span>
        </div>
      )}

      {modal === 'reject' && (
        <form onSubmit={handleRejectSubmit} className={styles.modalForm}>
          <h4 className={styles.modalTitle}>رفض التقييم</h4>
          <textarea
            name="reason"
            required
            minLength={3}
            maxLength={200}
            rows={2}
            placeholder="سبب الرفض..."
            dir="rtl"
            className={styles.textarea}
          />
          <div className={styles.modalActions}>
            <button type="submit" disabled={pending} className={styles.rejectBtn}>
              تأكيد الرفض
            </button>
            <button
              type="button"
              onClick={() => setModal(null)}
              disabled={pending}
              className={styles.cancelBtn}
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {modal === 'delete' && (
        <div className={styles.modalForm}>
          <h4 className={styles.modalTitle}>حذف نهائي</h4>
          <p className={styles.modalWarning}>⚠️ الحذف نهائي — مش هيرجع. متأكد؟</p>
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className={styles.rejectBtn}
            >
              نعم، احذف
            </button>
            <button
              type="button"
              onClick={() => setModal(null)}
              disabled={pending}
              className={styles.cancelBtn}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className={styles.foot}>
        <span className={styles.date}>{date}</span>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleApprove}
            disabled={pending}
            className={styles.approve}
          >
            <CheckCircleIcon size={14} />
            <span>موافقة</span>
          </button>
          <button
            type="button"
            onClick={() => setModal('reject')}
            disabled={pending}
            className={styles.reject}
          >
            <CloseIcon size={14} />
            <span>رفض</span>
          </button>
          <button
            type="button"
            onClick={() => setModal('delete')}
            disabled={pending}
            className={styles.deleteBtn}
            aria-label="حذف"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
