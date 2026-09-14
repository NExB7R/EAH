'use client'
import { useEffect, useState } from 'react'
import './install-app-button.css'

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

const STORAGE_KEY = 'eah-install-prompt-dismissed-at'
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 يوم

export default function InstallAppButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(true)
  const [isIOS, setIsIOS] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true
    setIsStandalone(standalone)
    if (standalone) return

    // آخر مرة رفض؟ نستنى
    const last = Number(localStorage.getItem(STORAGE_KEY) ?? 0)
    if (Date.now() - last < DISMISS_TTL_MS) return

    const ua = navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream
    setIsIOS(ios)

    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onBIP)

    // على iOS، ما فيش BIP — نعرض الزر بعد 20 ثانية
    const iosTimer = ios ? setTimeout(() => setVisible(true), 20000) : null

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      if (iosTimer) clearTimeout(iosTimer)
    }
  }, [])

  async function install() {
    if (isIOS) {
      // iOS: guided instructions
      alert(
        'للتثبيت على iPhone:\n\n' +
          '1. افتح Safari\n' +
          '2. اضغط زر المشاركة (⬆️)\n' +
          '3. اختر "إضافة إلى الشاشة الرئيسية"\n\n' +
          'التطبيق هيشتغل كأنه أصلي بعد كده 👍'
      )
      return
    }
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDeferred(null)
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    setVisible(false)
  }

  if (isStandalone || !visible) return null

  return (
    <div className="iab">
      <button
        type="button"
        className="iab__close"
        onClick={dismiss}
        aria-label="لاحقاً"
        title="لاحقاً"
      >
        ×
      </button>
      <div className="iab__body">
        <span className="iab__icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="3" />
            <path d="M12 18h.01" />
          </svg>
        </span>
        <div className="iab__text">
          <strong className="iab__title">ثبّت EAH</strong>
          <span className="iab__sub">يشتغل بدون إنترنت • أسرع • إشعارات</span>
        </div>
        <button type="button" className="iab__btn" onClick={install}>
          تثبيت
        </button>
      </div>
    </div>
  )
}
