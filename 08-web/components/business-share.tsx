'use client'
import { useState } from 'react'
import './business-share.css'

export default function BusinessShare({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? `${window.location.origin}/businesses/${slug}` : ''
  const text = `${name} على EAH — اللي نفسك فيه ؟`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  const socials = [
    { key: 'wa', label: 'واتساب', emoji: '💬', href: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}` },
    { key: 'fb', label: 'فيسبوك', emoji: '📘', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { key: 'tg', label: 'تليجرام', emoji: '✈️', href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { key: 'tw', label: 'تويتر', emoji: '🐦', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
  ]

  return (
    <div className="bshare">
      <button type="button" className="bshare__btn" onClick={() => setOpen((p) => !p)} aria-label="شارك النشاط">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        <span>شارك</span>
      </button>

      {open && (
        <div className="bshare__panel">
          <div className="bshare__row">
            {socials.map((s) => (
              <a key={s.key} href={s.href} target="_blank" rel="noreferrer" className={`bshare__social bshare__social--${s.key}`} aria-label={s.label}>
                <span>{s.emoji}</span>
                <small>{s.label}</small>
              </a>
            ))}
            <button type="button" className="bshare__social bshare__social--copy" onClick={copy}>
              <span>{copied ? '✅' : '📋'}</span>
              <small>{copied ? 'اتنسخ' : 'نسخ'}</small>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
