'use client'
import { useState } from 'react'
import { IconShare } from './neon-icons'
import './neon-icon-button.css'

export default function ShareButton() {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://eah.app'
    const text = 'اكتشف EAH — اللي نفسك فيه ؟'

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as any).share({ title: 'EAH', text, url })
        return
      } catch {
        /* المستخدم لغى المشاركة */
      }
    }

    // fallback: نسخ الرابط
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* نسخ فشل */
    }
  }

  return (
    <button
      type="button"
      className="neon-icon-btn"
      aria-label="شارك المنصة"
      onClick={handleShare}
    >
      <span className="neon-icon-btn__icon" aria-hidden><IconShare /></span>
      <span className="neon-icon-btn__label">{copied ? 'تم النسخ' : 'شارك'}</span>
    </button>
  )
}
