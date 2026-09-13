'use client'
import { useEffect, useState } from 'react'
import './install-app-button.css'

type Platform = 'android' | 'ios' | 'desktop' | 'installed' | 'unknown'

export default function InstallAppButton() {
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [deferred, setDeferred] = useState<any>(null)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setPlatform('installed'); setInstalled(true); return
    }
    const ua = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(ua)
    const isAndroid = /android/.test(ua)

    if (isIOS) { setPlatform('ios'); return }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e)
      setPlatform(isAndroid ? 'android' : 'desktop')
    }
    window.addEventListener('beforeinstallprompt', handler)
    setPlatform(isAndroid ? 'android' : 'desktop')
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (platform === 'ios') { setShowIOSModal(true); return }
    if (deferred) {
      deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') { setInstalled(true); setPlatform('installed') }
      setDeferred(null)
    } else {
      alert('افتح قائمة المتصفح واختر "Install app" أو "Add to Home Screen"')
    }
  }

  if (installed || platform === 'installed') return null

  return (
    <>
      <button className="iab-btn" onClick={install} aria-label="ثبّت التطبيق" title="ثبّت EAH">
        <span className="iab-btn__icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </span>
      </button>
      {showIOSModal && <IOSInstructions onClose={() => setShowIOSModal(false)} />}
    </>
  )
}

function IOSInstructions({ onClose }: { onClose: () => void }) {
  return (
    <div className="iab-modal" onClick={onClose}>
      <div className="iab-modal__card" onClick={e => e.stopPropagation()}>
        <header className="iab-modal__head">
          <span className="iab-modal__emoji">📱</span>
          <h3 className="iab-modal__title">ثبّت EAH على iPhone</h3>
          <button className="iab-modal__close" onClick={onClose}>×</button>
        </header>
        <div className="iab-modal__steps">
          <div className="iab-modal__step"><span className="iab-modal__num">1</span><div><strong>افتح في Safari</strong><span>لازم Safari — مش Chrome</span></div></div>
          <div className="iab-modal__step"><span className="iab-modal__num">2</span><div><strong>اضغط زر المشاركة</strong><span>الأيقونة ⎋ تحت في النص</span></div></div>
          <div className="iab-modal__step"><span className="iab-modal__num">3</span><div><strong>اختر "Add to Home Screen"</strong><span>اتمرر واختار ➕ إضافة للشاشة الرئيسية</span></div></div>
          <div className="iab-modal__step"><span className="iab-modal__num">4</span><div><strong>اضغط "Add"</strong><span>هتلاقي EAH على شاشتك الرئيسية</span></div></div>
        </div>
        <p className="iab-modal__note">💡 ملاحظة: iOS مبيسمحش بزر تلقائي للتثبيت، لازم يدويًا</p>
      </div>
    </div>
  )
}
