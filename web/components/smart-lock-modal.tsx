'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LockIcon, CloseIcon, CheckCircleIcon, CrownGoldIcon } from './icons'
import styles from './smart-lock-modal.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Smart Lock Modal (مهذّب — يفتح عند محاولة فعل مقفول)
// ═══════════════════════════════════════════════════════════

type Props = {
  open: boolean
  onClose: () => void
  action: string
  hint?: string
}

const PERKS = [
  'اطلب مباشرة على واتساب',
  'احفظ أنشطتك المفضلة',
  'تابع عروض الأنشطة اللي بتحبها',
  'اكسب نقاط مع كل تفاعل',
]

export default function SmartLockModal({ open, onClose, action, hint }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <button
          type="button"
          onClick={onClose}
          className={styles.close}
          aria-label="إغلاق"
        >
          <CloseIcon size={18} />
        </button>

        <div className={styles.glow} aria-hidden />

        <span className={styles.icon} aria-hidden>
          <LockIcon size={26} />
        </span>

        <span className={styles.badge}>
          <CrownGoldIcon size={11} />
          ميزة للمسجلين
        </span>

        <h2 className={styles.title}>
          عايز {action}؟
        </h2>

        <p className={styles.text}>
          {hint ?? 'سجّل بسرعة في 30 ثانية — هي هتفتحلك كل مميزات EAH'}
        </p>

        <ul className={styles.perks}>
          {PERKS.map((p) => (
            <li key={p}>
              <CheckCircleIcon size={14} />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <Link
            href="/auth"
            className={styles.primary}
            onClick={onClose}
          >
            سجّل دلوقتي — مجاناً
          </Link>
          <button
            type="button"
            onClick={onClose}
            className={styles.ghost}
          >
            خليني أتفرج
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Hook للاستخدام ───
export function useSmartLock() {
  const [state, setState] = useState<{ open: boolean; action: string; hint?: string }>({
    open: false,
    action: '',
  })

  return {
    open: state.open,
    action: state.action,
    hint: state.hint,
    trigger: (action: string, hint?: string) => setState({ open: true, action, hint }),
    close: () => setState({ open: false, action: '' }),
  }
}
