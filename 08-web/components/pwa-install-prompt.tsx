'use client'
import { useEffect, useState } from 'react'

export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('eah-pwa-dismissed') === '1') return
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e)
      setTimeout(() => setShow(true), 30000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!deferred) return
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') setShow(false)
    setDeferred(null)
  }

  function dismiss() {
    localStorage.setItem('eah-pwa-dismissed', '1')
    setDismissed(true)
    setShow(false)
  }

  if (!show || dismissed) return null

  return (
    <div className="pwa-prompt">
      <span className="pwa-prompt__emoji">📱</span>
      <div className="pwa-prompt__body">
        <strong className="pwa-prompt__title">ثبّت EAH على موبايلك</strong>
        <span className="pwa-prompt__text">وصول أسرع + إشعارات</span>
      </div>
      <div className="pwa-prompt__actions">
        <button className="pwa-prompt__btn pwa-prompt__btn--primary" onClick={install}>ثبّت</button>
        <button className="pwa-prompt__btn" onClick={dismiss}>لاحقًا</button>
      </div>
    </div>
  )
}
