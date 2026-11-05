'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
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
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const modal = modalRef.current
    const getFocusable = () =>
      Array.from(
        modal?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getAttribute('aria-hidden') !== 'true')

    getFocusable()[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }

      if (event.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open || !done) return
    const timeout = window.setTimeout(() => {
      setOpen(false)
      setDone(false)
      router.refresh()
    }, 1500)
    return () => window.clearTimeout(timeout)
  }, [done, open, router])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('entityType', entityType)
    fd.set('entityId', entityId)

    startTransition(async () => {
      try {
        const res = await submitReport(fd)
        if (res.ok) {
          setDone(true)
        } else {
          setError(res.error)
        }
      } catch {
        setError('تعذر إرسال البلاغ بسبب مشكلة اتصال. حاول مرة أخرى.')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null)
          setDone(false)
          setOpen(true)
        }}
        className={variant === 'icon' ? styles.iconBtn : styles.menuBtn}
        aria-label="إبلاغ"
      >
        <AlertIcon size={14} />
        {variant !== 'icon' && <span>{label}</span>}
      </button>

      {open && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-dialog-title"
          aria-describedby={done ? undefined : 'report-dialog-description'}
        >
          <div className={styles.modal} ref={modalRef}>
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
                <p role="status" aria-live="polite">وصلنا بلاغك — شكراً</p>
                <small>هيتم المراجعة خلال 24-48 ساعة</small>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <h3 className={styles.title} id="report-dialog-title">إبلاغ</h3>
                <p className={styles.subtitle} id="report-dialog-description">اختار السبب:</p>

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

                {error && <div className={styles.error} role="alert">{error}</div>}

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
