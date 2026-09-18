'use client'
import { useState } from 'react'
import './business-share.css'

type Props = { slug: string; name: string }

export default function BusinessShare({ slug, name }: Props) {
  const [open, setOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://eah-sq.vercel.app'
  const url = `${origin}/businesses/${slug}`
  const text = `${name} على EAH — اللي نفسك فيه ؟`
  const msg = `${text}\n${url}`
  const qrSrc = `/api/qr?url=${encodeURIComponent(url)}&size=512`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(10)
    } catch {}
  }

  async function shareNative() {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as any).share({ title: name, text, url })
        return
      } catch {}
    }
    setOpen(true)
  }

  const socials = [
    { key: 'wa',  label: 'واتساب',   href: `https://wa.me/?text=${encodeURIComponent(msg)}` },
    { key: 'fb',  label: 'فيسبوك',   href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { key: 'tw',  label: 'X',        href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
    { key: 'tg',  label: 'تليجرام',  href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { key: 'sms', label: 'رسالة SMS', href: `sms:?body=${encodeURIComponent(msg)}` },
  ]

  return (
    <>
      <button type="button" className="bshare__btn" onClick={shareNative} aria-label="شارك النشاط">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        <span>شارك</span>
      </button>

      {open && (
        <div className="bshare__overlay" onClick={() => setOpen(false)}>
          <div className="bshare__sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bshare__head">
              <h3>شارك {name}</h3>
              <button type="button" className="bshare__close" onClick={() => setOpen(false)} aria-label="إغلاق">×</button>
            </div>

            <div className="bshare__row">
              {socials.map((s) => (
                <a key={s.key} href={s.href} target="_blank" rel="noreferrer" className={`bshare__social bshare__social--${s.key}`}>
                  <span className="bshare__social-label">{s.label}</span>
                </a>
              ))}
              <button type="button" className="bshare__social bshare__social--copy" onClick={copy}>
                <span className="bshare__social-label">{copied ? 'اتنسخ' : 'نسخ'}</span>
              </button>
              <button type="button" className="bshare__social bshare__social--qr" onClick={() => { setQrOpen(true); setOpen(false) }}>
                <span className="bshare__social-label">QR</span>
              </button>
            </div>

            <div className="bshare__url">
              <input type="text" readOnly value={url} onFocus={(e) => e.currentTarget.select()} dir="ltr" />
            </div>
          </div>
        </div>
      )}

      {qrOpen && (
        <div className="bshare__overlay" onClick={() => setQrOpen(false)}>
          <div className="bshare__sheet bshare__sheet--qr" onClick={(e) => e.stopPropagation()}>
            <div className="bshare__head">
              <h3>QR — {name}</h3>
              <button type="button" className="bshare__close" onClick={() => setQrOpen(false)} aria-label="إغلاق">×</button>
            </div>
            <div className="bshare__qr-wrap">
              <img src={qrSrc} alt={`QR ${name}`} width={280} height={280} className="bshare__qr-img" />
            </div>
            <p className="bshare__qr-hint">خد الـ QR وطبعه أو ابعته لأي حد — يفتح النشاط على طول</p>
            <div className="bshare__qr-actions">
              <a href={qrSrc} download={`${slug}-qr.png`} className="bshare__qr-btn">حمّل الصورة</a>
              <button type="button" className="bshare__qr-btn bshare__qr-btn--copy" onClick={copy}>{copied ? 'اتنسخ ✓' : 'انسخ اللينك'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
