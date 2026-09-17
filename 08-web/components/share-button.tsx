'use client'
import { useState } from 'react'
import './share-button.css'

export default function ShareButton() {
  const [open, setOpen] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.origin : 'https://eah-sq.vercel.app'
  const text = 'جرب EAH — اللي نفسك فيه؟ كل حاجة حواليك في مكان واحد'

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
      setOpen(false)
    } catch { /* silent */ }
  }

  return (
    <>
      <button type="button" className="sb-trigger-share" onClick={share} aria-label="شارك EAH" title="شارك EAH">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>

      {open && (
        <div className="share-modal" onClick={() => setOpen(false)} role="dialog">
          <div className="share-modal__panel" onClick={(e) => e.stopPropagation()}>
            <button className="share-modal__close" onClick={() => setOpen(false)} aria-label="إغلاق">×</button>
            <h3 className="share-modal__title">شارك EAH</h3>
            <p className="share-modal__sub">امسح الكود أو انسخ الرابط — صحابك هيعرفوك</p>
            <img
              src={`/api/qr?url=${encodeURIComponent(url)}&size=280`}
              alt="QR EAH"
              className="share-modal__qr"
              width={280}
              height={280}
            />
            <div className="share-modal__actions">
              <button type="button" onClick={copy} className="share-modal__btn">
                نسخ الرابط
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`}
                target="_blank"
                rel="noreferrer"
                className="share-modal__btn share-modal__btn--wa"
              >
                واتساب
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noreferrer"
                className="share-modal__btn share-modal__btn--fb"
              >
                فيسبوك
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}
                target="_blank"
                rel="noreferrer"
                className="share-modal__btn"
              >
                ✈️ تليجرام
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noreferrer"
                className="share-modal__btn"
              >
                🐦 X
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
