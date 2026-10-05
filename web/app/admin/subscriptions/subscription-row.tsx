'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, CloseIcon, CrownGoldIcon } from '@/components/icons'
import {
  approveSubscription,
  rejectSubscription,
  extendSubscription,
  cancelSubscription,
} from './actions'
import styles from './subscriptions.module.css'

type Row = {
  id: string
  status: string
  is_trial: boolean
  starts_at: string | null
  expires_at: string | null
  plan: { name_ar: string; price_egp: number } | null
  business: { name: string; slug: string } | null
}

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  pending: { label: 'معلّق', tone: 'pending' },
  trial: { label: 'تجربة', tone: 'trial' },
  active: { label: 'نشط', tone: 'active' },
  expired: { label: 'منتهي', tone: 'expired' },
  cancelled: { label: 'ملغي', tone: 'cancelled' },
}

export default function SubscriptionRow({ sub }: { sub: Row }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showReject, setShowReject] = useState(false)
  const router = useRouter()

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null)
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) setError(res.error ?? 'فشل')
      else router.refresh()
    })
  }

  const handleApprove = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    run(() => approveSubscription(sub.id, fd))
  }

  const handleReject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await rejectSubscription(sub.id, fd)
      if (res.ok) {
        setShowReject(false)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  const meta = STATUS_LABEL[sub.status] ?? { label: sub.status, tone: 'pending' }
  const expires = sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('ar-EG') : '—'
  const isPending = sub.status === 'pending'

  return (
    <div className={styles.row}>
      <div className={styles.icon}>
        <CrownGoldIcon size={20} />
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{sub.business?.name ?? '—'}</div>
        <div className={styles.meta}>
          <span>{sub.plan?.name_ar ?? '—'}</span>
          <span className={styles.dot}>·</span>
          <span>{sub.plan?.price_egp ?? 0} ج.م</span>
          <span className={styles.dot}>·</span>
          <span>ينتهي: {expires}</span>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {showReject ? (
          <form onSubmit={handleReject} className={styles.rejectForm}>
            <textarea
              name="reason"
              required
              minLength={5}
              maxLength={300}
              rows={2}
              placeholder="سبب الرفض..."
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
            {isPending && (
              <form onSubmit={handleApprove} className={styles.approveForm}>
                <label className={styles.checkLabel}>
                  <input type="checkbox" name="is_trial" defaultChecked />
                  <span>تجربة مجانية</span>
                </label>
                <input
                  type="number"
                  name="days"
                  min={1}
                  max={730}
                  defaultValue={30}
                  className={styles.daysInput}
                />
                <button type="submit" disabled={pending} className={styles.okBtn}>
                  <CheckCircleIcon size={14} />
                  <span>تفعيل</span>
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
              </form>
            )}

            {(sub.status === 'trial' || sub.status === 'active') && (
              <>
                <button
                  type="button"
                  onClick={() => run(() => extendSubscription(sub.id, 30))}
                  disabled={pending}
                  className={styles.okBtn}
                >
                  تمديد 30 يوم
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('إلغاء الاشتراك؟')) run(() => cancelSubscription(sub.id))
                  }}
                  disabled={pending}
                  className={styles.dangerBtn}
                >
                  إلغاء
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <span className={`${styles.status} ${styles[meta.tone]}`}>
        {sub.is_trial && '✨ '}
        {meta.label}
      </span>
    </div>
  )
}
