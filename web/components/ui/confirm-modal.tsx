'use client'

import { useEffect, useRef } from 'react'
import { AlertIcon, CloseIcon } from '@/components/icons'
import styles from './confirm-modal.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Confirm Modal (reusable)
// ═══════════════════════════════════════════════════════════

type Props = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'warn' | 'default'
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  tone = 'danger',
  pending = false,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  // Escape + focus
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pending) onCancel()
    }
    window.addEventListener('keydown', onKey)
    cancelRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, pending, onCancel])

  // منع scroll الخلفية
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={pending ? undefined : onCancel} role="presentation">
      <div
        className={`${styles.modal} ${styles[tone]}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onCancel}
          disabled={pending}
          aria-label="إغلاق"
        >
          <CloseIcon size={16} />
        </button>

        <div className={styles.iconWrap}>
          <AlertIcon size={26} />
        </div>

        <h2 id="confirm-title" className={styles.title}>
          {title}
        </h2>

        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={pending}
            className={styles.cancelBtn}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`${styles.confirmBtn} ${styles[`confirm_${tone}`]}`}
          >
            {pending ? 'جاري التنفيذ…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
