'use client'

import { useEffect, useState } from 'react'
import { WifiOffIcon, RefreshIcon, AlertIcon } from './icons'
import { useOnlineStatus } from '@/lib/hooks/use-online-status'
import { getPending, flushQueue } from '@/lib/offline/queue'
import styles from './offline-badge.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Offline Badge
// شريط برتقالي لما النت يقطع + عدّاد المعلقات
// ═══════════════════════════════════════════════════════════

export default function OfflineBadge() {
  const online = useOnlineStatus()
  const [pending, setPending] = useState(0)
  const [flushing, setFlushing] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const check = async () => {
      const p = await getPending()
      setPending(p.length)
    }
    void check()
    const t = setInterval(check, 5000)
    return () => clearInterval(t)
  }, [online])

  if (online && pending === 0 && !notice) return null

  const handleRetry = async () => {
    setFlushing(true)
    const res = await flushQueue()
    setFlushing(false)
    const p = await getPending()
    setPending(p.length)
    if (res.discarded > 0) {
      setNotice('اتشال تقييم من المزامنة لأنه لا يوجد طلب مكتمل مرتبط به. تقدر تعيد التقييم بعد اكتمال الطلب.')
    } else {
      setNotice(null)
    }
    if (res.flushed > 0) {
      // اختفى تلقائياً لو النجاح
    }
  }

  return (
    <div className={styles.bar} role="status" aria-live="polite">
      <span className={styles.icon}>
        {notice ? <AlertIcon size={14} /> : <WifiOffIcon size={14} />}
      </span>
      <span className={styles.text}>
        {notice && notice}
        {!notice && !online && pending > 0 && (
          <>
            أنت offline — <strong>{pending}</strong> عملية هتتبعت لما النت يرجع
          </>
        )}
        {!notice && !online && pending === 0 && <>أنت offline — تقدر تتصفح المخزن</>}
        {!notice && online && pending > 0 && (
          <>
            في <strong>{pending}</strong> عملية في الانتظار
          </>
        )}
      </span>
      {online && pending > 0 && (
        <button type="button" className={styles.retry} onClick={handleRetry} disabled={flushing}>
          <RefreshIcon size={12} />
          <span>{flushing ? '...' : 'جرب'}</span>
        </button>
      )}
    </div>
  )
}
