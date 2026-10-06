'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertIcon, CloseIcon, CheckCircleIcon } from '@/components/icons'
import { submitReport } from './actions'
import styles from './report-button.module.css'

type Props = {
  entityType: 'business' | 'review' | 'user'
  entityId: string
  label?: string
  variant?: 'icon' | 'button' | 'menu'
}

const REASONS: { value: string; label: string }[] = [
  { value: 'spam', label: 'سبام' },
  { value: 'offensive', label: 'محتوى مسيء' },
  { value: 'fake', label: 'محتوى مزيّف' },
  { value: 'harassment', label: 'تحرش/إساءة' },
  { value: 'wrong_info', label: 'معلومات غلط' },
  { value: 'other', label: 'سبب آخر' },
]

export default function ReportButton({
  entityType,
  entityId,
  label = 'إبلاغ',
  variant = 'menu',
}: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('entityType', entityType)
    fd.set('entityId', entityId)

    startTransition(async () => {
      const res = await submitReport(fd)
      if (res.ok) {
        setDone(true)
        setTimeout(() => {
          setOpen(false)
          setDone(false)
          router.refresh()
        }, 1500)
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={variant === 'icon' ? styles.iconBtn : styles.menuBtn}
        aria-label="إبلاغ"
      >
        <AlertIcon size={14} />
        {variant !== 'icon' && <span>{label}</span>}
      </button>

      {open && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={styles.close}
              aria-label="إغلاق"
            >
              <CloseIcon size={16} />
            </button>

            {done ? (
              <div className={styles.doneBox}>
                <CheckCircleIcon size={32} />
                <p>وصلنا بلاغك — شكراً</p>
                <small>هيتم المراجعة خلال 24-48 ساعة</small>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <h3 className={styles.title}>إبلاغ</h3>
                <p className={styles.subtitle}>اختار السبب:</p>

                <div className={styles.reasons}>
                  {REASONS.map((r) => (
                    <label key={r.value} className={styles.reasonItem}>
                      <input type="radio" name="reason" value={r.value} required />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>

                <textarea
                  name="note"
                  rows={3}
                  maxLength={500}
                  placeholder="تفاصيل إضافية (اختياري)..."
                  className={styles.note}
                  dir="rtl"
                />

                {error && <div className={styles.error}>{error}</div>}

                <button type="submit" disabled={pending} className={styles.submitBtn}>
                  {pending ? 'جاري الإرسال...' : 'إرسال البلاغ'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
