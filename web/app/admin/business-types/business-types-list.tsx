'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, CloseIcon, AlertIcon, ArrowLeftIcon } from '@/components/icons'
import { approveBusinessType, rejectBusinessType } from './actions'
import type { PendingType } from './page'
import styles from './business-types.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business Types List (Client)
// ═══════════════════════════════════════════════════════════

type Props = {
  items: PendingType[]
}

export default function BusinessTypesList({ items }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const visible = items.filter((b) => !removedIds.has(b.id))

  const handleApprove = (id: string) => {
    setError(null)
    setRemovedIds((prev) => new Set([...prev, id]))
    startTransition(async () => {
      const res = await approveBusinessType(id)
      if (res.ok) {
        router.refresh()
      } else {
        setRemovedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        setError(res.error)
      }
    })
  }

  const handleReject = () => {
    if (!rejecting) return
    const id = rejecting
    setError(null)
    setRemovedIds((prev) => new Set([...prev, id]))
    setRejecting(null)
    startTransition(async () => {
      const res = await rejectBusinessType(id, reason)
      if (res.ok) {
        setReason('')
        router.refresh()
      } else {
        setRemovedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        setError(res.error)
      }
    })
  }

  return (
    <>
      {error && (
        <div className={styles.error}>
          <AlertIcon size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.list}>
        {visible.map((b) => {
          const date = new Date(b.created_at).toLocaleDateString('ar-EG', {
            day: '2-digit',
            month: 'short',
          })
          return (
            <article key={b.id} className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardInfo}>
                  <span className={styles.typeBadge}>{b.custom_business_type ?? '—'}</span>
                  <h3 className={styles.bizName}>{b.name}</h3>
                </div>
                <span className={styles.date}>{date}</span>
              </div>
              {b.area && <p className={styles.area}>{b.area}</p>}

              <div className={styles.cardActions}>
                <Link href={`/admin/businesses/${b.id}`} className={styles.viewBtn}>
                  <ArrowLeftIcon size={12} />
                  <span>عرض</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setRejecting(b.id)
                    setReason('')
                  }}
                  disabled={pending}
                  className={styles.rejectBtn}
                >
                  <CloseIcon size={12} />
                  <span>رفض</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(b.id)}
                  disabled={pending}
                  className={styles.approveBtn}
                >
                  <CheckCircleIcon size={12} />
                  <span>موافقة</span>
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {rejecting && (
        <div className={styles.modalBackdrop} onClick={() => setRejecting(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>سبب الرفض</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 300))}
              placeholder="مثال: النوع غير مناسب للمنصة"
              className={styles.textarea}
              rows={3}
              dir="rtl"
            />
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setRejecting(null)} className={styles.cancelBtn}>
                إلغاء
              </button>
              <button type="button" onClick={handleReject} className={styles.rejectBtn}>
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
