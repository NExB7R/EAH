'use client'

import { useEffect, useState } from 'react'
import { InstallIcon, CloseIcon, SparklesIcon, CheckIcon } from './icons'
import styles from './install-prompt.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Install Prompt (يدوي + persuasion UI)
//   • يظهر عند حدث eah:show-install
//   • "مش دلوقتي" → يتأخر دقيقتين
//   • "ثبّت" → يظهر الـ native prompt
// ═══════════════════════════════════════════════════════════

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const KEY_DISMISSED = 'eah-install-dismissed-at'
const DISMISS_COOLDOWN_MS = 2 * 60 * 1000

const BENEFITS = ['افتح EAH من غير متصفح', 'اشتغل بدون إنترنت', 'إشعارات فورية بالعروض']

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    const onShow = () => {
      const lastDismiss = Number(localStorage.getItem(KEY_DISMISSED) ?? 0)
      if (Date.now() - lastDismiss < DISMISS_COOLDOWN_MS) return
      const ua = window.navigator.userAgent
      const ios = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
      setIsIOS(ios)
      setVisible(true)
    }
    window.addEventListener('eah:show-install', onShow)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('eah:show-install', onShow)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(KEY_DISMISSED, String(Date.now()))
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
        const { markInstallAccepted } = await import('@/lib/engagement')
        markInstallAccepted()
      }
      setVisible(false)
    } catch {
      setVisible(false)
    }
  }

  if (!visible) return null

  const showNativeInstall = !isIOS && !!deferred

  return (
    <div className="eah-backdrop" onClick={dismiss}>
      <div
        className={`eah-modal ${styles.modal}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button type="button" className="eah-close" onClick={dismiss} aria-label="إغلاق">
          <CloseIcon size={18} />
        </button>

        <div className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.iconWrap}>
            <InstallIcon size={38} />
          </div>
          <span className={styles.badge}>
            <SparklesIcon size={12} /> موصى به
          </span>
        </div>

        <h2 className={styles.title}>ثبّت EAH على جهازك</h2>
        <p className={styles.subtitle}>تجربة أسرع، بدون متصفح، وتوصلك إشعارات بالعروض الجديدة.</p>

        <ul className={styles.benefits}>
          {BENEFITS.map((b) => (
            <li key={b} className={styles.benefit}>
              <span className={styles.checkIcon}>
                <CheckIcon size={14} />
              </span>
              {b}
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          {showNativeInstall ? (
            <button type="button" className={styles.primaryBtn} onClick={install}>
              <InstallIcon size={16} />
              ثبّت الآن
            </button>
          ) : isIOS ? (
            <button type="button" className={styles.primaryBtn} onClick={dismiss}>
              تمام، فهمت
            </button>
          ) : (
            <button type="button" className={styles.primaryBtn} onClick={dismiss}>
              تمام
            </button>
          )}
          <button type="button" className={styles.secondaryBtn} onClick={dismiss}>
            مش دلوقتي
          </button>
        </div>

        {isIOS && (
          <p className={styles.iosHint}>
            اضغط <strong>زر المشاركة</strong> في المتصفح، بعدين{' '}
            <strong>&quot;إضافة إلى الشاشة الرئيسية&quot;</strong>
          </p>
        )}
      </div>
    </div>
  )
}
