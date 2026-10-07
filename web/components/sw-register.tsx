'use client'

import { useEffect } from 'react'
import { flushQueue } from '@/lib/offline/queue'

// ═══════════════════════════════════════════════════════════
// EAH — Service Worker Registration + Queue Flusher
// ═══════════════════════════════════════════════════════════

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    // تسجيل
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})

    // استقبل رسائل من SW → flush queue
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FLUSH_QUEUE') {
        void flushQueue()
      }
    }
    navigator.serviceWorker.addEventListener('message', onMessage)

    // flush عند العودة online
    const onOnline = () => {
      void flushQueue()
    }
    window.addEventListener('online', onOnline)

    // flush أول ما الصفحة تفتح (لو فيه queue)
    void flushQueue()

    return () => {
      navigator.serviceWorker.removeEventListener('message', onMessage)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  return null
}
