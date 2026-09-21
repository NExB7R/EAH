'use client'
import Link from 'next/link'
import './visitor-value.css'
import { IcCompass, IcSparkles, IcMarket } from './eah-icons'

const CARDS = [
  {
    key: 'discover',
    Icon: IcCompass,
    kicker: 'اكتشف',
    title: 'اللي حواليك',
    body: 'مطاعم، صيدليات، ماركت، وتوصيل — كل ده على بُعد خطوة',
    cta: { label: 'ابدأ الاستكشاف', href: '/explore' },
    accent: 'purple',
  },
  {
    key: 'recommend',
    Icon: IcSparkles,
    kicker: 'مزاجك',
    title: 'قول واحنا نظبط',
    body: 'ترشيحات ذكية على حسب ميزانيتك ومنطقتك ومزاجك',
    cta: { label: 'جرّب دلوقتي', href: '/recommend' },
    accent: 'gold',
  },
  {
    key: 'order',
    Icon: IcMarket,
    kicker: 'اطلب',
    title: 'من أي مكان',
    body: 'اكتب طلبك — يوصل مباشرة على واتساب المكان. بدون وسيط',
    cta: { label: 'شوف الأماكن', href: '/explore' },
    accent: 'green',
  },
]

export default function VisitorValue() {
  return (
    <section className="vv" aria-label="ليه EAH">
      <header className="vv__head">
        <span className="vv__kicker">ليه EAH؟</span>
        <h2 className="vv__title">ثلاث حاجات هتخليك تحبنا</h2>
        <p className="vv__sub">منصة محلية، بتتكلم لغتك، وبتوصلك بسرعة</p>
      </header>

      <div className="vv__grid">
        {CARDS.map((c, i) => {
          const Icon = c.Icon
          return (
            <article key={c.key} className={`vv__card vv__card--${c.accent}`} style={{ '--vv-i': i } as React.CSSProperties}>
              <span className="vv__icon" aria-hidden><Icon /></span>
              <div className="vv__content">
                <span className="vv__card-kicker">{c.kicker}</span>
                <h3 className="vv__card-title">{c.title}</h3>
                <p className="vv__card-body">{c.body}</p>
                <Link href={c.cta.href} className="vv__cta">
                  {c.cta.label}
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
