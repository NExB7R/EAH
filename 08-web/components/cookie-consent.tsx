'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import './cookie-consent.css'

const KEY = 'eah-cookie-consent'

function ICookie() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12a9 9 0 1 1-9-9 4 4 0 0 0 5 5 4 4 0 0 0 4 4z" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="14" cy="15" r="1" fill="currentColor" />
      <circle cx="10" cy="16" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
    </svg>
  )
}

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(KEY)) return
    const t = setTimeout(() => setShow(true), 4000)
    return () => clearTimeout(t)
  }, [])

  function accept() {
    localStorage.setItem(KEY, 'accepted')
    setShow(false)
  }
  function reject() {
    localStorage.setItem(KEY, 'essential-only')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="ck" role="dialog" aria-label="إشعار ملفات الارتباط">
      <div className="ck__inner">
        <span className="ck__icon" aria-hidden><ICookie /></span>
        <div className="ck__body">
          <strong className="ck__title">ملفات ارتباط بسيطة</strong>
          <p className="ck__text">
            بنستخدم كوكيز بسيطة عشان المنصة تشتغل وتحفظ تفضيلاتك. اعرف أكتر في{' '}
            <Link href="/cookies" className="ck__link">سياسة الكوكيز</Link>.
          </p>
        </div>
        <div className="ck__actions">
          <button type="button" className="ck__btn ck__btn--primary" onClick={accept}>تمام</button>
          <button type="button" className="ck__btn ck__btn--ghost" onClick={reject}>الأساسية بس</button>
        </div>
      </div>
    </div>
  )
}
