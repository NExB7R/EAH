'use client'

import { useEffect, useState } from 'react'
import { InstallIcon, CloseIcon } from './icons'
import styles from './install-prompt.module.css'

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
    // لو مثبتة → متظهرش
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // لو المستخدم رفض قبل كده → متظهرش
    if (localStorage.getItem(STORAGE_KEY)) return

    // iOS؟ (مفيش beforeinstallprompt)
    const ua = window.navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
    setIsIOS(ios)

    if (ios) {
      const t = setTimeout(() => setVisible(true), 30000)
      return () => clearTimeout(t)
    }

    // Chrome/Edge → beforeinstallprompt
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setTimeout(() => setVisible(true), 30000)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)

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
    if (!deferred) return
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

  return (
    <div className={styles.backdrop} onClick={dismiss}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className={styles.closeBtn}
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
            ? 'اضغط زر المشاركة، بعدين "إضافة إلى الشاشة الرئيسية".'
            : 'افتح أسرع، استخدمه بدون إنترنت، ووصلك إشعارات.'}
        </p>

        <div className={styles.actions}>
          {isIOS ? (
            <button type="button" className={styles.primary} onClick={dismiss}>
              تمام
            </button>
          ) : (
            <button type="button" className={styles.primary} onClick={install}>
              ثبّت الآن
            </button>
          )}
          <button type="button" className={styles.secondary} onClick={dismiss}>
            مش دلوقتي
          </button>
        </div>
      </div>
    </div>
  )
}
