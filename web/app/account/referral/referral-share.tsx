'use client'

import { useState } from 'react'
import { ShareIcon, CheckCircleIcon, WhatsAppIcon } from '@/components/icons'
import styles from './referral.module.css'

type Props = {
  code: string
  url: string
}

export default function ReferralShare({ code, url }: Props) {
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const message = `انضم لـ EAH — منصة الاكتشاف المحلية. استخدم كودي: ${code}\n${url}`

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'EAH', text: message, url })
        return
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`

  return (
    <div className={styles.shareRow}>
      <button type="button" onClick={handleCopyCode} className={styles.btnGhost}>
        {copiedCode ? <CheckCircleIcon size={14} /> : <ShareIcon size={14} />}
        <span>{copiedCode ? 'اتنسخ' : 'انسخ الكود'}</span>
      </button>

      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.btnWa}>
        <WhatsAppIcon size={14} />
        <span>شارك على واتساب</span>
      </a>

      <button type="button" onClick={handleShare} className={styles.btnPrimary}>
        <ShareIcon size={14} />
        <span>{copied ? 'اتنسخ' : 'شارك الرابط'}</span>
      </button>
    </div>
  )
}
