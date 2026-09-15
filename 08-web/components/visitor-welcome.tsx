'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import './visitor-welcome.css'

const BENEFITS = [
  {
    emoji: '🍽️',
    title: 'اكتشف أماكن جديدة',
    body: 'مطاعم، صيدليات، ماركت، توصيل — كله في مكان واحد.',
  },
  {
    emoji: '🔥',
    title: 'عروض حقيقية',
    body: 'خصومات يومية من الأماكن اللي بتحبها.',
  },
  {
    emoji: '⭐',
    title: 'قيّم وشارك',
    body: 'رأيك يساعد غيرك يلاقي الأفضل.',
  },
  {
    emoji: '💰',
    title: 'نقاط ومكافآت',
    body: 'اكسب نقاط على كل تفاعل — واستبدلها بعروض.',
  },
]

const MERCHANT_BENEFITS = [
  {
    emoji: '🏪',
    title: 'ظهور مجاني',
    body: 'سجّل نشاطك واعرضه لآلاف العملاء.',
  },
  {
    emoji: '📊',
    title: 'تحليلات نشاطك',
    body: 'اعرف مين بيدور عليك وامتى.',
  },
  {
    emoji: '💬',
    title: 'رد على التقييمات',
    body: 'تواصل مباشر مع عملائك.',
  },
  {
    emoji: '🚀',
    title: 'اشتراك مميز',
    body: 'ظهور أول + معرض عروض + شارة مميز.',
  },
]

export default function VisitorWelcome() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let alive = true
    const dismissed = localStorage.getItem('eah-visitor-dismissed') === '1'
    if (dismissed) return

    const supabase = createClient()
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (alive && !user) setShow(true)
    })()
    return () => { alive = false }
  }, [])

  function dismiss() {
    localStorage.setItem('eah-visitor-dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <section className="vw">
      <button
        type="button"
        className="vw__close"
        onClick={dismiss}
        aria-label="إغلاق"
      >
        ×
      </button>

      <header className="vw__head">
        <span className="vw__kicker">لأول مرة على EAH؟</span>
        <h2 className="vw__title">اعرف بتستفيد إيه</h2>
        <p className="vw__sub">كل حاجة في EAH مجانية للعميل — بدون رسوم، بدون تعقيد.</p>
      </header>

      <div className="vw__section">
        <h3 className="vw__section-title">
          <span className="vw__section-icon">🛍️</span>
          لو أنت عميل
        </h3>
        <div className="vw__grid">
          {BENEFITS.map((b) => (
            <div key={b.title} className="vw__card">
              <span className="vw__emoji">{b.emoji}</span>
              <h4 className="vw__card-title">{b.title}</h4>
              <p className="vw__card-body">{b.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="vw__section">
        <h3 className="vw__section-title">
          <span className="vw__section-icon">🏪</span>
          لو عندك نشاط
        </h3>
        <div className="vw__grid">
          {MERCHANT_BENEFITS.map((b) => (
            <div key={b.title} className="vw__card vw__card--merchant">
              <span className="vw__emoji">{b.emoji}</span>
              <h4 className="vw__card-title">{b.title}</h4>
              <p className="vw__card-body">{b.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="vw__cta">
        <Link href="/auth" className="vw__btn vw__btn--primary">
          ابدأ مجاناً
        </Link>
        <a
          href="https://wa.me/201012892806?text=%D8%B9%D8%A7%D9%8A%D8%B2%20%D8%A3%D8%B9%D8%B1%D9%81%20%D8%A3%D9%83%D8%AA%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%A8%D8%A7%D9%82%D8%A7%D8%AA"
          target="_blank"
          rel="noreferrer"
          className="vw__btn vw__btn--ghost"
        >
          💬 تواصل واتساب
        </a>
      </div>
    </section>
  )
}
