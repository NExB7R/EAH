'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  SparklesIcon,
  CheckCircleIcon,
  WhatsAppIcon,
  ShareIcon,
  CopyIcon,
} from '@/components/icons'
import { generateBusinessQr } from './actions'
import styles from './qr.module.css'

type Props = {
  slug: string
  businessName: string
}

export default function QrGenerator({ slug, businessName }: Props) {
  const [qr, setQr] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  const businessUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/businesses/${slug}`
      : `/businesses/${slug}`

  // Auto-generate on mount (fast — QR lib is server-side)
  useEffect(() => {
    if (qr) return
    startTransition(async () => {
      const res = await generateBusinessQr(slug)
      if (res.ok) setQr(res.dataUrl)
      else setError(res.error)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDownload = () => {
    if (!qr) return
    const a = document.createElement('a')
    a.href = qr
    a.download = `eah-${slug}-qr.png`
    a.click()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(businessUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback — ignore
    }
  }

  const handleWhatsappShare = () => {
    const text = `اطلب من ${businessName} على EAH:\n${businessUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleWebShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: businessName,
          text: `اطلب من ${businessName} على EAH`,
          url: businessUrl,
        })
      } catch {
        // user cancelled — ignore
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className={styles.generator}>
      {!qr && !pending && (
        <button
          type="button"
          onClick={() => {
            setError(null)
            startTransition(async () => {
              const res = await generateBusinessQr(slug)
              if (res.ok) setQr(res.dataUrl)
              else setError(res.error)
            })
          }}
          className={styles.btn}
        >
          <SparklesIcon size={16} />
          <span>ولّد الكود</span>
        </button>
      )}

      {pending && !qr && <p className={styles.hint}>جاري توليد الكود…</p>}

      {error && <p className={styles.error}>{error}</p>}

      {qr && (
        <>
          <div className={styles.qrBox}>
            <div
              className={styles.qrImg}
              style={{ backgroundImage: `url(${qr})` }}
              role="img"
              aria-label={`QR — ${businessName}`}
            />
          </div>

          <p className={styles.qrUrl}>{businessUrl}</p>

          <div className={styles.actions}>
            <button type="button" onClick={handleDownload} className={styles.btn}>
              <CheckCircleIcon size={14} />
              <span>حمّل PNG</span>
            </button>
            <button type="button" onClick={() => window.print()} className={styles.btnGhost}>
              اطبع
            </button>
          </div>

          <div className={styles.shareSection}>
            <p className={styles.shareTitle}>شارك رابط نشاطك</p>
            <div className={styles.shareGrid}>
              <button type="button" onClick={handleCopy} className={styles.shareBtn}>
                <CheckCircleIcon size={16} />
                <span>{copied ? 'اتنسخ ✓' : 'انسخ الرابط'}</span>
              </button>
              <button
                type="button"
                onClick={handleWhatsappShare}
                className={`${styles.shareBtn} ${styles.shareWhatsapp}`}
              >
                <WhatsAppIcon size={16} />
                <span>واتساب</span>
              </button>
              <button type="button" onClick={handleWebShare} className={styles.shareBtn}>
                <ShareIcon size={16} />
                <span>شارك</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
