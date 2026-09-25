'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CloseIcon, SparklesIcon } from './icons'
import styles from './signup-prompt.module.css'

const STORAGE_KEY = 'eah-signup-prompt-dismissed'

export default function SignupPrompt() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // لو مسجل → متظهرش
    if (document.cookie.includes('sb-') && document.cookie.includes('-auth-token')) return

    // لو رفض قبل كده → متظهرش
    if (localStorage.getItem(STORAGE_KEY)) return

    // لو في /auth أو /account → متظهرش
    const path = window.location.pathname
    if (path.startsWith('/auth') || path.startsWith('/account') || path.startsWith('/merchant')) return

    const t = setTimeout(() => setVisible(true), 45000)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={styles.backdrop} onClick={dismiss}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={dismiss}
          aria-label="إغلاق"
        >
          <CloseIcon size={18} />
        </button>

        <div className={styles.iconWrap}>
          <SparklesIcon size={28} />
        </div>

        <h2 className={styles.title}>عايز تستفيد أكتر من EAH؟</h2>
        <p className={styles.text}>
          سجّل في 30 ثانية، اكتشف أماكن أقرب، واكسب نقاط مع كل طلب.
        </p>

        <div className={styles.actions}>
          <Link href="/auth" className={styles.primary} onClick={dismiss}>
            سجّل الآن
          </Link>
          <button type="button" className={styles.secondary} onClick={dismiss}>
            مش دلوقتي
          </button>
        </div>
      </div>
    </div>
  )
}
