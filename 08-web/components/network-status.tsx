'use client'
import { useEffect, useState } from 'react'
import './network-status.css'

export default function NetworkStatus() {
  const [online, setOnline] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [justBack, setJustBack] = useState(false)

  useEffect(() => {
    setMounted(true)
    setOnline(navigator.onLine)

    const handleOnline = () => {
      setOnline(true)
      setJustBack(true)
      setTimeout(() => setJustBack(false), 2400)
    }
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!mounted) return null
  if (online && !justBack) return null

  return (
    <div
      className={`nstatus ${online ? 'is-online' : 'is-offline'}`}
      role="status"
      aria-live="polite"
    >
      
      <span className="nstatus__text">
        {online ? 'رجع النت ' : 'أنت أوفلاين — وضع محدود'}
      </span>
    </div>
  )
}
