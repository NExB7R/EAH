'use client'

import { useEffect, useState } from 'react'
import { CloseIcon, ShareIcon, CheckCircleIcon, WhatsAppIcon } from './icons'
import styles from './business-share-modal.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business Share Modal
// Platforms: WhatsApp / Twitter / Facebook / Telegram / Copy / QR
// QR encodes the public business page (per product decision).
// ═══════════════════════════════════════════════════════════

type Props = {
  open: boolean
  onClose: () => void
  url: string
  title: string
}

type Tab = 'share' | 'qr'

export default function BusinessShareModal({ open, onClose, url, title }: Props) {
  const [tab, setTab] = useState<Tab>('share')
  const [copied, setCopied] = useState(false)
  const [qr, setQr] = useState<{ url: string; dataUrl: string } | null>(null)
  const [qrErrorUrl, setQrErrorUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open || tab !== 'qr') return

    let cancelled = false
    void import('qrcode')
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: { dark: '#07020D', light: '#FFFFFF' },
        }),
      )
      .then((dataUrl) => {
        if (!cancelled) setQr({ url, dataUrl })
      })
      .catch(() => {
        if (!cancelled) setQrErrorUrl(url)
      })

    return () => {
      cancelled = true
    }
  }, [open, tab, url])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null
  const qrDataUrl = qr?.url === url ? qr.dataUrl : null
  const qrFailed = qrErrorUrl === url

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  }


  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`مشاركة ${title}`}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>شارك {title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="إغلاق">
            <CloseIcon size={18} />
          </button>
        </header>

        <div className={styles.tabs}>
          <button
            type="button"
            className={tab === 'share' ? styles.tabActive : styles.tab}
            onClick={() => setTab('share')}
          >
            <ShareIcon size={14} />
            <span>شارك</span>
          </button>
          <button
            type="button"
            className={tab === 'qr' ? styles.tabActive : styles.tab}
            onClick={() => setTab('qr')}
          >
            <span>QR</span>
          </button>
        </div>

        {tab === 'share' && (
          <div className={styles.shareGrid}>
            <a
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.shareBtn} ${styles.whatsapp}`}
            >
              <WhatsAppIcon size={20} />
              <span>واتساب</span>
            </a>
            <a
              href={links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.shareBtn} ${styles.twitter}`}
            >
              <span className={styles.platform}>𝕏</span>
              <span>تويتر</span>
            </a>
            <a
              href={links.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.shareBtn} ${styles.facebook}`}
            >
              <span className={styles.platform}>f</span>
              <span>فيسبوك</span>
            </a>
            <a
              href={links.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.shareBtn} ${styles.telegram}`}
            >
              <span className={styles.platform}>t</span>
              <span>تيليجرام</span>
            </a>
            <button type="button" className={`${styles.shareBtn} ${styles.copy}`} onClick={copy}>
              {copied ? <CheckCircleIcon size={18} /> : <ShareIcon size={18} />}
              <span>{copied ? 'اتنسخ' : 'نسخ الرابط'}</span>
            </button>
            <button
              type="button"
              className={`${styles.shareBtn} ${styles.qrBtn}`}
              onClick={() => setTab('qr')}
            >
              <span className={styles.platform}>▦</span>
              <span>QR</span>
            </button>
          </div>
        )}

        {tab === 'qr' && (
          <div className={styles.qrWrap}>
            <div className={styles.qrFrame}>
              {qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrDataUrl}
                  alt={`رمز QR لصفحة ${title}`}
                  className={styles.qrImg}
                  width={280}
                  height={280}
                />
              ) : qrFailed ? (
                <p className={styles.qrHint} role="alert">تعذر إنشاء الرمز. حاول مرة تانية.</p>
              ) : (
                <p className={styles.qrHint} role="status">جارٍ تجهيز رمز QR…</p>
              )}
            </div>
            <p className={styles.qrHint}>امسح الكود لفتح الصفحة مباشرة</p>
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download="eah-qr.png"
                className={styles.downloadBtn}
              >
                تحميل رمز QR
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
