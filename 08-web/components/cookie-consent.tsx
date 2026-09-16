'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import './cookie-consent.css'

const KEY = 'eah-cookie-consent'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const val = localStorage.getItem(KEY)
    if (val) return
    const t = setTimeout(() => setShow(true), 2500)
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
        <span className="ck__emoji" aria-hidden>🍪</span>
        <div className="ck__body">
          <strong className="ck__title">ببنستخدم ملفات ارتباط</strong>
          <p className="ck__text">
            ببنستخدمها لتشغيل المنصة وحفظ تفضيلاتك.
            اعرف أكتر في{' '}
            <Link href="/cookies" className="ck__link">سياسة كوكيز</Link>.
          </p>
        </div>
        <div className="ck__actions">
          <button type="button" className="ck__btn ck__btn--primary" onClick={accept}>
            تمام، يلا
          </button>
          <button type="button" className="ck__btn ck__btn--ghost" onClick={reject}>
            الضرورية بس
          </button>
        </div>
      </div>
    </div>
  )
}
