'use client'

import { useEffect, useState } from 'react'
import {
  InstallIcon,
  CloseIcon,
  SparklesIcon,
  CheckIcon,
  ShareIcon,
  TargetIcon,
  LampIcon,
  BellIcon,
} from './icons'
import styles from './install-prompt.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Install Prompt (2026)
//   • يظهر عند حدث eah:show-install
//   • iOS → تعليمات مصوّرة بالرموز
//   • Android/Desktop → native prompt
//   • 3 مستويات رفض (دقيقتين / أسبوع / أبداً)
// ═══════════════════════════════════════════════════════════

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const KEY_DISMISSED_SOFT = 'eah-install-soft-dismiss'
const KEY_DISMISSED_HARD = 'eah-install-hard-dismiss'
const SOFT_COOLDOWN_MS = 3 * 60 * 1000 // 3 دقايق

const BENEFITS = [
  {
    Icon: InstallIcon,
    title: 'من غير متصفح',
    desc: 'افتحها من أيقونة على الشاشة الرئيسية',
  },
  {
    Icon: LampIcon,
    title: 'أسرع بمرتين',
    desc: 'تحميل فوري بدون انتظار',
  },
  {
    Icon: BellIcon,
    title: 'إشعارات فورية',
    desc: 'العروض الجديدة توصلك أول بأول',
  },
  {
    Icon: TargetIcon,
    title: 'موقعك محفوظ',
    desc: 'اكتشف اللي حواليك بضغطة',
  },
]

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [canNativeInstall, setCanNativeInstall] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // خلاص مثبّت → خروج
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setCanNativeInstall(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    const onShow = () => {
      // رفض دائم
      if (localStorage.getItem(KEY_DISMISSED_HARD)) return

      // رفض مؤقت
      const lastSoft = Number(localStorage.getItem(KEY_DISMISSED_SOFT) ?? 0)
      if (Date.now() - lastSoft < SOFT_COOLDOWN_MS) return

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

  const dismissSoft = () => {
    localStorage.setItem(KEY_DISMISSED_SOFT, String(Date.now()))
    setVisible(false)
  }

  const dismissHard = () => {
    localStorage.setItem(KEY_DISMISSED_HARD, '1')
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

  return (
    <div className="eah-backdrop" onClick={dismissSoft}>
      <div
        className={`eah-modal ${styles.modal}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button type="button" className="eah-close" onClick={dismissSoft} aria-label="إغلاق">
          <CloseIcon size={18} />
        </button>

        <div className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.iconWrap}>
            <InstallIcon size={40} />
          </div>
          <span className={styles.badge}>
            <SparklesIcon size={12} /> موصى به
          </span>
        </div>

        <h2 className={styles.title}>ثبّت EAH</h2>
        <p className={styles.subtitle}>تجربة أسرع، بدون متصفح — خدها على شاشتك الرئيسية.</p>

        {/* iOS — خطوات مصوّرة */}
        {isIOS && !canNativeInstall ? (
          <div className={styles.iosSteps}>
            <div className={styles.iosStep}>
              <span className={styles.iosNum}>1</span>
              <div className={styles.iosBody}>
                <strong>افتح زر المشاركة</strong>
                <small>
                  في شريط المتصفح تحت
                  <ShareIcon size={14} className={styles.shareIcon} />
                </small>
              </div>
            </div>
            <div className={styles.iosStep}>
              <span className={styles.iosNum}>2</span>
              <div className={styles.iosBody}>
                <strong>اختار &quot;إضافة للشاشة الرئيسية&quot;</strong>
                <small>هتلاقيه في القائمة اللي هتفتح</small>
              </div>
            </div>
            <div className={styles.iosStep}>
              <span className={styles.iosNum}>3</span>
              <div className={styles.iosBody}>
                <strong>اضغط &quot;إضافة&quot;</strong>
                <small>ثانية واحدة والأيقونة هتبان</small>
              </div>
            </div>
          </div>
        ) : (
          <ul className={styles.benefits}>
            {BENEFITS.map((b) => (
              <li key={b.title} className={styles.benefit}>
                <span className={styles.benefitIcon}>
                  <b.Icon size={16} />
                </span>
                <div className={styles.benefitBody}>
                  <strong className={styles.benefitTitle}>{b.title}</strong>
                  <small className={styles.benefitDesc}>{b.desc}</small>
                </div>
                <span className={styles.checkIcon}>
                  <CheckIcon size={12} />
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.actions}>
          {canNativeInstall ? (
            <button type="button" className={styles.primaryBtn} onClick={install}>
              <InstallIcon size={16} />
              <span>ثبّت الآن</span>
            </button>
          ) : (
            <button type="button" className={styles.primaryBtn} onClick={dismissSoft}>
              <span>تمام، فهمت</span>
            </button>
          )}
          <button type="button" className={styles.secondaryBtn} onClick={dismissHard}>
            متظهرهاش تاني
          </button>
        </div>
      </div>
    </div>
  )
}
