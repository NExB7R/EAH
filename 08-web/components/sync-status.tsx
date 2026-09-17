'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { getPendingCount, flushQueue } from '@/lib/sync-manager'
import './sync-status.css'

export default function SyncStatus() {
  const [online, setOnline] = useState(true)
  const [showBack, setShowBack] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(() => getPendingCount())

  useEffect(() => {
    const update = () => {
      const isOnline = navigator.onLine
      const was = online
      setOnline(isOnline)
      if (!was && isOnline) {
        setShowBack(true)
        setTimeout(() => setShowBack(false), 3000)
        void syncPending()
      }
    }
    const goOffline = () => { setOnline(false); setShowBack(false) }
    const goOnline = () => update()

    update()
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [online])

  async function syncPending() {
    setSyncing(true)
    try {
      await flushQueue()
      setPendingCount(0)
      const supabase = createClient()
      await supabase.auth.refreshSession().catch(() => {})
    } catch { /* silent */ }
    setSyncing(false)
  }

  if (online && !showBack) return null

  return (
    <div className={`sync ${online ? 'is-back' : 'is-offline'}`} role="status" aria-live="polite">
      <span className="sync__dot" />
      <span className="sync__text">
        {online
          ? '✅ رجع النت — بنحدّث كل حاجة'
          : '🌐 إنت أوفلاين — المنصة شغالة عادي'}
      </span>
      {pendingCount > 0 && (
        <span className="sync__badge">{pendingCount} في الانتظار</span>
      )}
      {online && syncing && <span className="sync__spinner" />}
    </div>
  )
}
