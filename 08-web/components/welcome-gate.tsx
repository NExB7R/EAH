'use client'
import { useEffect, useState } from 'react'
import './welcome-gate.css'

const STORAGE_KEY = 'eah-welcome-seen-v1'

function IClose() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function ICompass() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="16 8 14 14 8 16 10 10 16 8"/></svg>
}
function IChat() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
}
function IStar() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.3 5.5 21 7 14 2 9.3 9 9"/></svg>
}
function IBolt() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>
}
function IArrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
}

const FEATURES = [
  { icon: <ICompass />, title: 'اكتشف كل اللي حواليك', desc: 'مطاعم • صيدليات • توصيل • ماركت', accent: '' },
  { icon: <IChat />, title: 'اطلب على واتساب مباشرة', desc: 'بدون وسيط، بدون عمولة، بدون تعقيد', accent: 'teal' },
  { icon: <IStar />, title: 'مميزين + ترند + عروض', desc: 'تعرف الأفضل والترند بسرعة', accent: 'gold' },
]

export default function WelcomeGate() {
  const [mounted, setMounted] = useState(false)
  const [show, setShow] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (document.documentElement.classList.contains('wg-seen')) return
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        document.documentElement.classList.add('wg-seen')
        return
      }
    } catch {}
    setShow(true)
  }, [])

  useEffect(() => {
    if (!show) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [show])

  function dismiss() {
    setLeaving(true)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
      document.documentElement.classList.add('wg-seen')
    } catch {}
    setTimeout(() => setShow(false), 400)
  }

  if (!mounted || !show) return null

  return (
    <div className={`wg ${leaving ? 'is-leaving' : ''}`} role="dialog" aria-label="مرحبا بيك في EAH">
      <button type="button" className="wg__close" onClick={dismiss} aria-label="إغلاق"><IClose /></button>
      <div className="wg__inner">
        <div className="wg__logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eah-word.webp" alt="EAH" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eah-crown.webp" alt="" />
        </div>
        <p className="wg__hook-line">شبيك لبيك</p>
        <p className="wg__hook-sub">كل حاجة حواليك</p>
        <p className="wg__slogan">اللي نفسك فيه ؟</p>
        <div className="wg__pitch">
          <p className="wg__pitch-body">
            منصة <strong>محلية مصرية</strong> من قلب شبين القناطر —
            توصّل الناس بأماكنهم، وتخلي كل صاحب نشاط صغير يبان.
          </p>
        </div>
        <div className="wg__features">
          {FEATURES.map((f) => (
            <div key={f.title} className={`wg__feature ${f.accent ? `wg__feature--${f.accent}` : ''}`}>
              <span className="wg__feature-icon">{f.icon}</span>
              <div>
                <p className="wg__feature-title">{f.title}</p>
                <p className="wg__feature-desc" style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#A29DB5', fontWeight: 600 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="wg__cta" onClick={dismiss}>
          <IBolt /><span>يلا ابدأ</span><IArrow />
        </button>
        <p className="wg__note">صنع بكل <strong>♥</strong> في شبين القناطر</p>
      </div>
    </div>
  )
}
