'use client'
import { useEffect, useState } from 'react'
import './install-pwa-button.css'

export default function InstallPWAButton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const [deferred, setDeferred] = useState<any>(null)
  const [installed, setInstalled] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true); return
    }
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!deferred) return
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') { setShow(false); setInstalled(true) }
    setDeferred(null)
  }

  if (installed || !show) return null

  if (variant === 'compact') {
    return (
      <button className="ipb ipb--compact" onClick={install} aria-label="ثبّت EAH">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
    )
  }

  return (
    <button className="ipb" onClick={install}>
      <span className="ipb__icon">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </span>
      <span>ثبّت التطبيق</span>
    </button>
  )
}
