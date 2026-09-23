'use client'
import { useEffect, useState } from 'react'
import './welcome-gate.css'

const STORAGE_KEY = 'eah-welcome-seen-v1'

/* ═══ Icons ═══ */
function ICompass() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <polygon points="16 8 14 14 8 16 10 10 16 8" />
    </svg>
  )
}

function IChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IStar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.3 5.5 21 7 14 2 9.3 9 9" />
    </svg>
  )
}

function ISparkles() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  )
}

function IBolt() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10" />
    </svg>
  )
}

function IArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

/* ═══ Features ═══ */
const FEATURES = [
  {
    icon: <ICompass />,
    title: 'كل حاجة حواليك في مكان واحد',
    desc: 'مطاعم • صيدليات • توصيل • ماركت • أنشطة أخرى',
    accent: '',
  },
  {
    icon: <IChat />,
    title: 'اطلب على واتساب مباشرة',
    desc: 'بدون وسيط، بدون عمولة، بدون تعقيد',
    accent: 'teal',
  },
  {
    icon: <IStar />,
    title: 'مميزين + ترند + عروض',
    desc: 'تعرف الأماكن الأفضل والترند النهاردة بسرعة',
    accent: 'gold',
  },
  {
    icon: <ISparkles />,
    title: 'تجربة عربية أصلية',
    desc: 'بتتكلم لغتك، من قلب شبين القناطر والقرى حواليها',
    accent: '',
  },
]

/* ═══ Main ═══ */
export default function WelcomeGate() {
  const [show, setShow] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (!seen) setShow(true)
    } catch {
      setShow(true)
    }
  }, [])

  function dismiss() {
    setLeaving(true)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* silent */
    }
    setTimeout(() => setShow(false), 500)
  }

  if (!show) return null

  /* ═══ Stars — 12 نجمة موزعة ═══ */
  const stars = [
    { top: '8%',  left: '12%',  gold: false, delay: '0s' },
    { top: '15%', left: '78%',  gold: true,  delay: '0.5s' },
    { top: '25%', left: '8%',   gold: false, delay: '1s' },
    { top: '32%', left: '88%',  gold: false, delay: '1.5s' },
    { top: '45%', left: '6%',   gold: true,  delay: '2s' },
    { top: '55%', left: '92%',  gold: false, delay: '0.8s' },
    { top: '68%', left: '10%',  gold: false, delay: '1.3s' },
    { top: '75%', left: '85%',  gold: true,  delay: '0.3s' },
    { top: '85%', left: '18%',  gold: false, delay: '1.8s' },
    { top: '88%', left: '80%',  gold: false, delay: '0.6s' },
    { top: '5%',  left: '48%',  gold: true,  delay: '2.2s' },
    { top: '95%', left: '55%',  gold: false, delay: '1.1s' },
  ]

  return (
    <div className={`wg ${leaving ? 'is-leaving' : ''}`} role="dialog" aria-label="مرحبا بيك في EAH">
      {/* ═══ Stars ═══ */}
      <div className="wg__stars" aria-hidden>
        {stars.map((s, i) => (
          <span
            key={i}
            className={`wg__star ${s.gold ? 'wg__star--gold' : ''}`}
            style={{ top: s.top, left: s.left, animationDelay: s.delay }}
          />
        ))}
      </div>

      {/* ═══ Content ═══ */}
      <div className="wg__inner">

        {/* Logo + Crown */}
        <div className="wg__logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eah-word.webp" alt="EAH" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eah-crown.webp" alt="" />
        </div>

        {/* Slogan */}
        <h1 className="wg__slogan">اللي نفسك فيه ؟</h1>

        {/* Hook */}
        <div className="wg__hook">
          <p className="wg__hook-line">شبيك لبيك</p>
          <p className="wg__hook-sub">كل حاجة حواليك</p>
        </div>

        <div className="wg__divider" />

        {/* Pitch */}
        <div className="wg__pitch">
          <h2 className="wg__pitch-title">
            منصة <span>محلية مصرية</span>،
            <br />
            مبنية بحب من قلب شبين القناطر
          </h2>
          <p className="wg__pitch-body">
            بنوصّل الناس بأماكنهم المفضلة، وبنخلي كل صاحب نشاط صغير يبان.
            بدون وسيط، بدون عمولة، بدون تعقيد.
          </p>
        </div>

        {/* Features */}
        <div className="wg__features">
          {FEATURES.map((f) => (
            <div key={f.title} className={`wg__feature ${f.accent ? `wg__feature--${f.accent}` : ''}`}>
              <span className="wg__feature-icon">{f.icon}</span>
              <div className="wg__feature-body">
                <p className="wg__feature-title">{f.title}</p>
                <p className="wg__feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Punchline */}
        <div className="wg__punch">
          <p className="wg__punch-q">« شوفت الفكرة دي قبل كده؟ »</p>
          <p className="wg__punch-a">
            احنا مختلفين — تجربة محلية أصلية، بتتكلم لغتك، وبتفهم مزاجك.
          </p>
        </div>

        {/* CTA */}
        <button type="button" className="wg__cta" onClick={dismiss}>
          <IBolt />
          <span>يلا ابدأ</span>
          <IArrowLeft />
        </button>

        <p className="wg__note">
          صنع بكل <strong>♥</strong> في شبين القناطر — فلسطين في القلب 🇵🇸
        </p>
      </div>
    </div>
  )
}
