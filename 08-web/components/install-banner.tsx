'use client'
import { useEffect, useState } from 'react'
import './install-app-button.css'

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const [deferred, setDeferred] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem('eah-install-dismissed') === '1') return

    const ua = navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua)
    setIsIOS(ios)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // عرض البانر بعد تفاعل المستخدم (scroll) أو 60 ثانية
    let triggered = false
    const tryShow = () => {
      if (triggered) return
      triggered = true
      setTimeout(() => setShow(true), 1500)
    }
    const onScroll = () => {
      if (window.scrollY > 400) {
        tryShow()
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const timer = setTimeout(() => setShow(true), 60000)
    return () => { clearTimeout(timer); window.removeEventListener('beforeinstallprompt', handler); window.removeEventListener('scroll', onScroll) }
  }, [])

  async function install() {
    if (isIOS) {
      alert('افتح Safari → اضغط زر المشاركة → Add to Home Screen')
      return
    }
    if (deferred) {
      deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') setShow(false)
      setDeferred(null)
    }
  }

  function dismiss() {
    localStorage.setItem('eah-install-dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="iab-banner">
      <span className="iab-banner__emoji">📱</span>
      <div className="iab-banner__text">
        <strong>ثبّت EAH على موبايلك</strong>
        <span>أسرع + إشعارات + بدون نت</span>
      </div>
      <button className="iab-banner__btn" onClick={install}>تثبيت</button>
      <button
        style={{ background: 'transparent', border: 'none', color: '#6B6880', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
        onClick={dismiss}
        aria-label="إغلاق"
      >×</button>
    </div>
  )
}
