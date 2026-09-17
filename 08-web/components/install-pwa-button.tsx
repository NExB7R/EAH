'use client'
import { useEffect, useState } from 'react'
import './install-pwa-button.css'

type BIPEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPWAButton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [installed, setInstalled] = useState(true)
  const [isIOS, setIsIOS] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true
    setInstalled(standalone)
    if (standalone) return

    const ua = navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream
    setIsIOS(ios)

    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
    }
    window.addEventListener('beforeinstallprompt', onBIP)
    return () => window.removeEventListener('beforeinstallprompt', onBIP)
  }, [])

  async function handleClick() {
    if (deferred) {
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') setInstalled(true)
      setDeferred(null)
      return
    }
    setShowModal(true)
  }

  if (installed) return null

  const icon = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )

  return (
    <>
      {variant === 'compact' ? (
        <button className="ipb ipb--compact" onClick={handleClick} aria-label="ثبّت EAH" title="ثبّت EAH على جهازك">{icon}</button>
      ) : (
        <button className="ipb" onClick={handleClick}>
          <span className="ipb__icon">{icon}</span>
          <span>ثبّت التطبيق</span>
        </button>
      )}

      {showModal && (
        <div className="ipb-modal" onClick={() => setShowModal(false)} role="dialog" aria-modal="true">
          <div className="ipb-modal__panel" onClick={(e) => e.stopPropagation()}>
            <button className="ipb-modal__close" onClick={() => setShowModal(false)} aria-label="إغلاق">×</button>
            <h2 className="ipb-modal__title">ثبّت EAH على جهازك</h2>
            {isIOS ? (
              <>
                <p className="ipb-modal__lead">اتبع الخطوات دي على iPhone / iPad:</p>
                <ol className="ipb-modal__steps">
                  <li>افتح الموقع على <strong>Safari</strong></li>
                  <li>اضغط زر <strong>المشاركة</strong> (مربع + سهم فوق)</li>
                  <li>اختر <strong>إضافة إلى الشاشة الرئيسية</strong></li>
                  <li>اضغط <strong>إضافة</strong> — خلاص </li>
                </ol>
              </>
            ) : (
              <>
                <p className="ipb-modal__lead">لو الزر مش بيظهر لوحده، اعمل كده:</p>
                <ol className="ipb-modal__steps">
                  <li>افتح قائمة المتصفح (٣ نقط)</li>
                  <li>اختر <strong>تثبيت التطبيق</strong> أو <strong>إضافة إلى الشاشة الرئيسية</strong></li>
                  <li>اضغط <strong>تثبيت</strong> — خلاص </li>
                </ol>
              </>
            )}
            <p className="ipb-modal__note">بعد التثبيت: EAH يشتغل بدون إنترنت + إشعارات + أسرع 3×</p>
          </div>
        </div>
      )}
    </>
  )
}
