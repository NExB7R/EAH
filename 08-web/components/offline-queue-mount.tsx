'use client'
import { useEffect, useState } from 'react'
import { flush, count } from '@/lib/offline-queue'

export default function OfflineQueueMount() {
  const [pending, setPending] = useState(0)

  useEffect(() => {
    let mounted = true

    async function refresh() {
      try {
        const c = await count()
        if (mounted) setPending(c)
      } catch {
        /* IndexedDB unavailable */
      }
    }
    void refresh()

    async function tryFlush() {
      if (!navigator.onLine) return
      try {
        const { success } = await flush()
        if (success > 0 && mounted) {
          await refresh()
          // اطلب من SW يبلّغ المستخدم
          window.dispatchEvent(
            new CustomEvent('eah:queue-flushed', { detail: { count: success } })
          )
        }
      } catch {
        /* silent */
      }
    }

    // Event-based flush
    const onOnline = () => void tryFlush()
    const onManual = () => void tryFlush()
    window.addEventListener('online', onOnline)
    window.addEventListener('eah:flush-queue', onManual)

    // Periodic retry
    const interval = window.setInterval(tryFlush, 60_000)

    // أول flush بعد التحميل
    const t = window.setTimeout(tryFlush, 3_000)

    // Polling لعرض العدّاد
    const poll = window.setInterval(refresh, 5_000)

    return () => {
      mounted = false
      window.removeEventListener('online', onOnline)
      window.removeEventListener('eah:flush-queue', onManual)
      window.clearInterval(interval)
      window.clearInterval(poll)
      window.clearTimeout(t)
    }
  }, [])

  if (pending === 0) return null

  return (
    <div className="oq" role="status" aria-live="polite">
      
      <span className="oq__text">
        {pending} إجراءات في الانتظار
      </span>
      <button
        type="button"
        className="oq__btn"
        onClick={() => window.dispatchEvent(new CustomEvent('eah:flush-queue'))}
      >
        مزامنة
      </button>
    </div>
  )
}
