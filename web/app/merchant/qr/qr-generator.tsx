'use client'

import { useState, useTransition } from 'react'
import { SparklesIcon, CheckCircleIcon } from '@/components/icons'
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

  const handleGenerate = () => {
    setError(null)
    startTransition(async () => {
      const res = await generateBusinessQr(slug)
      if (res.ok) setQr(res.dataUrl)
      else setError(res.error)
    })
  }

  const handleDownload = () => {
    if (!qr) return
    const a = document.createElement('a')
    a.href = qr
    a.download = `eah-${slug}-qr.png`
    a.click()
  }

  return (
    <div className={styles.generator}>
      {!qr && (
        <button type="button" onClick={handleGenerate} disabled={pending} className={styles.btn}>
          <SparklesIcon size={16} />
          <span>{pending ? 'بيتولّد…' : 'ولّد الكود'}</span>
        </button>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {qr && (
        <>
          <div className={styles.qrBox}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt={`QR — ${businessName}`} className={styles.qrImg} />
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={handleDownload} className={styles.btn}>
              <CheckCircleIcon size={14} />
              <span>حمّل PNG</span>
            </button>
            <button type="button" onClick={() => window.print()} className={styles.btnGhost}>
              اطبع
            </button>
          </div>
        </>
      )}
    </div>
  )
}
