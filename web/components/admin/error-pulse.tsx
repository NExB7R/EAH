'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertIcon, CloseIcon } from '@/components/icons'
import styles from './error-pulse.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Critical Error Pulse
// يظهر toast لما يكون فيه أخطاء critical غير محلولة (24س)
// ═══════════════════════════════════════════════════════════

const DISMISS_KEY = 'eah-admin-error-pulse-dismissed'
const DISMISS_DURATION = 5 * 60 * 1000 // 5 دقايق

export default function ErrorPulse() {
  const [count, setCount] = useState(0)
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    const raw = sessionStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const ts = Number(raw)
    if (Date.now() - ts < DISMISS_DURATION) return true
    sessionStorage.removeItem(DISMISS_KEY)
    return false
  })

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      try {
        const res = await fetch('/api/admin/critical-pulse', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { critical: number }
        if (!cancelled) setCount(data.critical)
      } catch {
        // silent
      }
    }

    poll()
    const t = setInterval(poll, 30000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem(DISMISS_KEY, String(Date.now()))
  }

  if (count === 0 || dismissed) return null

  return (
    <div className={styles.toast} role="alert">
      <span className={styles.icon}>
        <AlertIcon size={18} />
      </span>
      <div className={styles.body}>
        <strong className={styles.title}>{count} خطأ حرج خلال 24 ساعة</strong>
        <span className={styles.desc}>راجع صحة النظام فوراً</span>
      </div>
      <Link href="/admin/health?severity=critical&resolved=unresolved" className={styles.action}>
        عرض
      </Link>
      <button type="button" onClick={handleDismiss} className={styles.close} aria-label="إخفاء">
        <CloseIcon size={12} />
      </button>
    </div>
  )
}
