'use client'
import { useState } from 'react'
import './share-button.css'

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
function IcCopy() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
}
function IcQr() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM21 14v3M14 21h3M21 21h.01"/></svg>
}

export default function ShareButton() {
  const [open, setOpen] = useState(false)
  const [qrView, setQrView] = useState(false)
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://eah-sq.vercel.app'
  const url = origin
  const text = 'جرب EAH — اللي نفسك فيه؟ كل حاجة حواليك في مكان واحد'
  const msg = `${text}\n${url}`

  function share() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      void navigator.share({ title: 'EAH', text, url })
    } else {
      setOpen(true)
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(10)
    } catch {}
  }

  function openModal() { setOpen(true); setQrView(false) }

  return (
    <>
      <button type="button" className="sb-trigger-share" onClick={share} onContextMenu={(e) => { e.preventDefault(); openModal() }} aria-label="شارك EAH" title="شارك EAH">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>

      {open && (
        <div className="share-modal" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <div className="share-modal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal__glow" />

            <header className="share-modal__head">
              <div className="share-modal__head-text">
                <h3 className="share-modal__title">شارك EAH</h3>
                <p className="share-modal__sub">
                  {qrView ? 'امسح الكود — صحابك يدخلوا على طول' : 'اختار طريقة المشاركة'}
                </p>
              </div>
              <button className="share-modal__close" onClick={() => setOpen(false)} aria-label="إغلاق">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </header>

            {qrView ? (
              <>
                <div className="share-modal__qr-wrap">
                  <img
                    src={`/api/qr?url=${encodeURIComponent(url)}&size=512`}
                    alt="QR EAH"
                    className="share-modal__qr"
                    width={260}
                    height={260}
                  />
                </div>
                <div className="share-modal__qr-actions">
                  <a
                    href={`/api/qr?url=${encodeURIComponent(url)}&size=512`}
                    download="eah-qr.png"
                    className="share-modal__btn share-modal__btn--primary"
                  >
                    حمّل الصورة
                  </a>
                  <button type="button" onClick={() => setQrView(false)} className="share-modal__btn share-modal__btn--ghost">
                    رجوع
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="share-modal__grid">
                  <a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" className="share-modal__social share-modal__social--wa">
                    <span className="share-modal__ic"><IcWhatsapp /></span>
                    <span className="share-modal__label">واتساب</span>
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="share-modal__social share-modal__social--fb">
                    <span className="share-modal__ic"><IcFacebook /></span>
                    <span className="share-modal__label">فيسبوك</span>
                  </a>
                  <button type="button" className="share-modal__social share-modal__social--copy" onClick={copy}>
                    <span className="share-modal__ic"><IcCopy /></span>
                    <span className="share-modal__label">{copied ? 'اتنسخ' : 'انسخ'}</span>
                  </button>
                  <button type="button" className="share-modal__social share-modal__social--qr" onClick={() => setQrView(true)}>
                    <span className="share-modal__ic"><IcQr /></span>
                    <span className="share-modal__label">QR</span>
                  </button>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="share-modal__social share-modal__social--x">
                    <span className="share-modal__ic"><IcX /></span>
                    <span className="share-modal__label">X</span>
                  </a>
                  <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" className="share-modal__social share-modal__social--tg">
                    <span className="share-modal__ic"><IcTelegram /></span>
                    <span className="share-modal__label">تليجرام</span>
                  </a>
                </div>

                <div className="share-modal__url">
                  <input type="text" readOnly value={url} onFocus={(e) => e.currentTarget.select()} dir="ltr" />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
