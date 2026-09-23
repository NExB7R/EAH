'use client'
import { useState } from 'react'
import './header-share-button.css'

function IcWhatsapp() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
}
function IcFacebook() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
}
function IcX() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l7.5 10L4 20h2l6.5-8.5L18 20h2l-7.5-10L20 4h-2l-6 8L6 4H4z"/></svg>
}
function IcTelegram() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>
}
function IcLink() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>
}
function IcCheck() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function IcShare() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  )
}
function IcClose() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}

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
    { key: 'wa', label: 'واتساب', Icon: IcWhatsapp, href: `https://wa.me/?text=${encodeURIComponent(msg)}` },
    { key: 'fb', label: 'فيسبوك', Icon: IcFacebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { key: 'tw', label: 'X', Icon: IcX, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
    { key: 'tg', label: 'تليجرام', Icon: IcTelegram, href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  ]

  return (
    <>
      <button type="button" className="hsb-trigger" onClick={() => setOpen(true)} aria-label="شارك EAH">
        <IcShare />
      </button>

      {open && (
        <div className="hsb-overlay" onClick={() => setOpen(false)}>
          <div className="hsb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hsb-head">
              <div>
                <span className="hsb-kicker">شارك EAH</span>
                <h3 className="hsb-title">اللي نفسك فيه ؟</h3>
              </div>
              <button type="button" className="hsb-close" onClick={() => setOpen(false)} aria-label="إغلاق"><IcClose /></button>
            </div>

            <div className="hsb-grid">
              {socials.map((s) => {
                const Icon = s.Icon
                return (
                  <a key={s.key} href={s.href} target="_blank" rel="noreferrer" className={`hsb-social hsb-social--${s.key}`}>
                    <span className="hsb-social-icon"><Icon /></span>
                    <span className="hsb-social-label">{s.label}</span>
                  </a>
                )
              })}
              <button type="button" className="hsb-social hsb-social--copy" onClick={copy}>
                <span className="hsb-social-icon">{copied ? <IcCheck /> : <IcLink />}</span>
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
