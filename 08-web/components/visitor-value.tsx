'use client'
import Link from 'next/link'
import './visitor-value.css'
import { IcCompass, IcSparkles, IcMarket } from './eah-icons'

const CARDS = [
  {
    key: 'discover',
    Icon: IcCompass,
    title: 'اكتشف اللي حواليك',
    body: 'مطاعم، صيدليات، ماركت، وتوصيل — كل ده على بُعد خطوة',
    cta: { label: 'اكتشف', href: '/explore' },
    accent: 'purple',
  },
  {
    key: 'recommend',
    Icon: IcSparkles,
    title: 'قول مزاجك واحنا نظبط',
    body: 'ترشيحات ذكية على حسب ميزانيتك ومنطقتك ومزاجك',
    cta: { label: 'جرّب', href: '/recommend' },
    accent: 'gold',
  },
  {
    key: 'order',
    Icon: IcMarket,
    title: 'اطلب من أي مكان',
    body: 'اكتب طلبك — يوصل مباشرة على واتساب المكان. بدون وسيط',
    cta: { label: 'شوف الأماكن', href: '/explore' },
    accent: 'purple',
  },
]

export default function VisitorValue() {
  return (
    <section className="vv" aria-label="ليه EAH">
      <header className="vv__head">
        <h2 className="vv__title">ليه تستخدم EAH؟</h2>
        <p className="vv__sub"></p>
      </header>

      <div className="vv__grid">
        {CARDS.map((c) => {
          const Icon = c.Icon
          return (
            <article key={c.key} className={`vv__card vv__card--${c.accent}`}>
              <span className="vv__emoji" aria-hidden><Icon /></span>
              <h3 className="vv__card-title">{c.title}</h3>
              <p className="vv__card-body">{c.body}</p>
              <Link href={c.cta.href} className="vv__cta">
                {c.cta.label} ←
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}
