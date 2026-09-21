'use client'
import { useState } from 'react'
import './header-share-button.css'

export default function HeaderShareButton() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const url = typeof window !== 'undefined' ? window.location.origin : 'https://eah-sq.vercel.app'
  const text = 'جرّب EAH — اللي نفسك فيه ؟'
  const msg = `${text}\n${url}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  const socials = [
    { key: 'wa', label: 'واتساب', icon: '💚', href: `https://wa.me/?text=${encodeURIComponent(msg)}` },
    { key: 'fb', label: 'فيسبوك', icon: '📘', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { key: 'tw', label: 'X', icon: '𝕏', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
    { key: 'tg', label: 'تليجرام', icon: '✈️', href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  ]

  return (
    <>
      <button
        type="button"
        className="hsb-trigger"
        onClick={() => setOpen(true)}
        aria-label="شارك EAH"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      {open && (
        <div className="hsb-overlay" onClick={() => setOpen(false)}>
          <div className="hsb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hsb-head">
              <div>
                <span className="hsb-kicker">شارك EAH</span>
                <h3 className="hsb-title">اللي نفسك فيه ؟</h3>
              </div>
              <button type="button" className="hsb-close" onClick={() => setOpen(false)} aria-label="إغلاق">×</button>
            </div>

            <div className="hsb-grid">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`hsb-social hsb-social--${s.key}`}
                >
                  <span className="hsb-social-icon">{s.icon}</span>
                  <span className="hsb-social-label">{s.label}</span>
                </a>
              ))}
              <button
                type="button"
                className="hsb-social hsb-social--copy"
                onClick={copy}
              >
                <span className="hsb-social-icon">{copied ? '✓' : '🔗'}</span>
                <span className="hsb-social-label">{copied ? 'اتنسخ' : 'نسخ'}</span>
              </button>
            </div>

            <div className="hsb-url">
              <input type="text" readOnly value={url} dir="ltr" onFocus={(e) => e.currentTarget.select()} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
