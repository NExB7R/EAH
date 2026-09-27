'use client'

import { useEffect, useState } from 'react'
import { InstallIcon, CloseIcon } from './icons'
import styles from './install-prompt.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Install Prompt (يدوي فقط — من زر الهيدر)
// ═══════════════════════════════════════════════════════════

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_KEY = 'eah-install-prompt-dismissed'

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // مثبتة أصلاً → متشتغلش خالص
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const ua = window.navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
    setIsIOS(ios)

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    // فتح يدوي فقط — من زر الهيدر
    const onManual = () => setVisible(true)
    window.addEventListener('eah:install-request', onManual)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('eah:install-request', onManual)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  const install = async () => {
    if (!deferred) {
      setVisible(false)
      return
    }
    try {
      await deferred.prompt()
      const choice = await deferred.userChoice
      if (choice.outcome === 'accepted') {
        localStorage.setItem(STORAGE_KEY, '1')
      }
      setVisible(false)
    } catch {
      setVisible(false)
    }
  }

  if (!visible) return null

  // لو iOS → إرشادات يدوية
  // لو Chrome/Edge و deferred موجود → زر تثبيت
  // لو deferred مش موجود (متصفح مش داعم) → إرشادات عامة
  const showNativeInstall = !isIOS && !!deferred

  return (
    <div className="eah-backdrop" onClick={dismiss}>
      <div
        className="eah-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="eah-close"
          onClick={dismiss}
          aria-label="إغلاق"
        >
          <CloseIcon size={18} />
        </button>

        <div className={styles.iconWrap}>
          <InstallIcon size={32} />
        </div>

        <h2 className={styles.title}>ثبّت EAH على جهازك</h2>
        <p className={styles.text}>
          {isIOS
            ? 'اضغط زر المشاركة في المتصفح، بعدين "إضافة إلى الشاشة الرئيسية".'
            : showNativeInstall
            ? 'افتح أسرع، استخدمه بدون إنترنت، ووصلك إشعارات.'
            : 'من قائمة المتصفح: "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".'}
        </p>

        <div className={styles.actions}>
          {showNativeInstall ? (
            <button type="button" className="eah-btn-primary" onClick={install}>
              ثبّت الآن
            </button>
          ) : (
            <button type="button" className="eah-btn-primary" onClick={dismiss}>
              تمام
            </button>
          )}
          <button type="button" className="eah-btn-secondary" onClick={dismiss}>
            مش دلوقتي
          </button>
        </div>
      </div>
    </div>
  )
}
