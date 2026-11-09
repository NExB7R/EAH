'use client'

import { useState } from 'react'
import styles from './verify-launch-button.module.css'

type CheckResult = {
  category: string
  check_name: string
  status: 'ok' | 'warn' | 'fail'
  message: string
}

type VerifyResult = {
  timestamp: string
  total: number
  okCount: number
  warnCount: number
  failCount: number
  checks: CheckResult[]
}

const STATUS_ICON = { ok: '✅', warn: '⚠️', fail: '❌' } as const

export default function VerifyLaunchButton() {
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/verify-launch', { cache: 'no-store' })
      const data = await res.json()
      setResult(data)
    } catch {
      alert('فشل الاتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>🔍 Verify Launch</h3>
          <p className={styles.subtitle}>
            تشغيل 16 فحص سريع للتأكد من جاهزية المنصة
          </p>
        </div>
        <button onClick={run} disabled={loading} className={styles.btn}>
          {loading ? 'جاري...' : result ? '🔄 إعادة' : '▶ تشغيل'}
        </button>
      </div>

      {result && (
        <>
          <div className={styles.summary}>
            <span className={styles.statOk}>✅ {result.okCount}</span>
            <span className={styles.statWarn}>⚠️ {result.warnCount}</span>
            <span className={styles.statFail}>❌ {result.failCount}</span>
            <span className={styles.total}>من {result.total}</span>
          </div>

          <ul className={styles.list}>
            {result.checks.map((c, i) => (
              <li key={i} className={`${styles.item} ${styles[`item-${c.status}`]}`}>
                <span className={styles.icon}>{STATUS_ICON[c.status]}</span>
                <div className={styles.body}>
                  <div className={styles.category}>{c.category}</div>
                  <div className={styles.checkName}>{c.check_name}</div>
                  <div className={styles.message}>{c.message}</div>
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.timestamp}>
            آخر تشغيل: {new Date(result.timestamp).toLocaleString('ar-EG')}
          </div>
        </>
      )}
    </div>
  )
}
