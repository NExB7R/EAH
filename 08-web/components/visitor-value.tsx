'use client'
import Link from 'next/link'
import './visitor-value.css'

const CARDS = [
  {
    key: 'discover',
    emoji: '🔍',
    title: 'اكتشف اللي حواليك',
    body: 'مطاعم، صيدليات، ماركت، وتوصيل — كل ده على بُعد خطوة',
    cta: { label: 'اكتشف', href: '/explore' },
    accent: 'purple',
  },
  {
    key: 'recommend',
    emoji: '✨',
    title: 'قول مزاجك واحنا نظبط',
    body: 'ترشيحات ذكية على حسب ميزانيتك ومنطقتك ومزاجك',
    cta: { label: 'جرّب', href: '/recommend' },
    accent: 'gold',
  },
  {
    key: 'order',
    emoji: '🛒',
    title: 'اطلب من أي مكان',
    body: 'اكتب طلبك — يوصل مباشرة على واتساب المكان. بدون وسيط',
    cta: { label: 'شوف الأماكن', href: '/explore' },
    accent: 'green',
  },
  {
    key: 'partner',
    emoji: '🏪',
    title: 'عندك نشاط؟',
    body: 'سجّل نشاطك مجاناً — بدون عمولة. اعرض لآلاف العملاء',
    cta: { label: 'سجّل نشاطك', href: '/merchant/apply' },
    accent: 'gold',
  },
]

export default function VisitorValue() {
  return (
    <section className="vv" aria-label="ليه EAH">
      <header className="vv__head">
        <span className="vv__kicker">WHY EAH</span>
        <h2 className="vv__title">ليه تستخدم EAH؟</h2>
        <p className="vv__sub">كل حاجة محتاجها — في مكان واحد</p>
      </header>

      <div className="vv__grid">
        {CARDS.map((c) => (
          <article key={c.key} className={`vv__card vv__card--${c.accent}`}>
            <span className="vv__emoji">{c.emoji}</span>
            <h3 className="vv__card-title">{c.title}</h3>
            <p className="vv__card-body">{c.body}</p>
            <Link href={c.cta.href} className="vv__cta">
              {c.cta.label} ←
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
