'use client'
import { useState } from 'react'

export default function ReferralCard({ code, invitedCount }: { code: string; invitedCount: number }) {
  const [copied, setCopied] = useState(false)
  const link = typeof window !== 'undefined' ? `${window.location.origin}/auth?ref=${code}` : ''

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(10)
    } catch {}
  }

  const share = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as any).share({
          title: 'EAH — اللي نفسك فيه؟',
          text: `جرّب EAH معايا، كود دعوتي: ${code}`,
          url: link,
        })
        return
      } catch {}
    }
    copy()
  }

  return (
    <div className="rc-card">
      <div className="rc-glow" />
      <div className="rc-head">
        <h3 className="rc-title">ادعي صحابك</h3>
        <p className="rc-sub">لما صاحبك يسجل بكودك، إنت تكسب نقاط</p>
      </div>
      <div className="rc-code">
        <span className="rc-code-label">كودك</span>
        <span className="rc-code-val">{code}</span>
      </div>
      <div className="rc-count">دعيت {invitedCount} صاحب</div>
      <div className="rc-actions">
        <button type="button" className="rc-btn rc-share" onClick={share}>شارك</button>
        <button type="button" className="rc-btn rc-copy" onClick={copy}>{copied ? 'اتنسخ ✓' : 'انسخ اللينك'}</button>
      </div>
    </div>
  )
}
