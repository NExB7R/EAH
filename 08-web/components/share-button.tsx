'use client'
import { useState } from 'react'
import './share-button.css'

export default function ShareButton({ url, title }: { url?: string; title?: string }) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '')
  const shareTitle = title ?? 'EAH — اللى نفسك فيه ؟'

  async function nativeShare() {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as any).share({ title: shareTitle, url: shareUrl })
        return
      } catch {}
    }
    setShowMenu(true)
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="shb-wrap">
      <button className="shb-btn" onClick={nativeShare} aria-label="شارك EAH" title="شارك">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div className="shb-overlay" onClick={() => setShowMenu(false)} />
          <div className="shb-menu">
            <a href={`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`} target="_blank" rel="noreferrer" className="shb-item shb-item--wa">
              <span>💚</span> واتساب
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="shb-item shb-item--fb">
              <span>📘</span> فيسبوك
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="shb-item shb-item--tw">
              <span>𝕏</span> تويتر
            </a>
            <button className="shb-item shb-item--copy" onClick={copyLink}>
              <span>{copied ? '✅' : '🔗'}</span> {copied ? 'اتنسخ!' : 'نسخ الرابط'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
