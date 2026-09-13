import Link from 'next/link'
import './trust-section.css'

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    title: 'أماكن موثوقة',
    desc: 'كل مكان بيتم التحقق منه قبل النشر',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'معلومات محدّثة',
    desc: 'مواعيد، عروض، وأرقام دايماً جديدة',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    ),
    title: 'تقييمات حقيقية',
    desc: 'آراء من ناس زيك — مش إعلانات',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
      </svg>
    ),
    title: 'اكتشاف ذكي',
    desc: 'ترشيحات على مزاجك بالذكاء الاصطناعي',
  },
]

export default function TrustSection() {
  return (
    <section className="trust">
      <header className="trust__head">
        <span className="trust__kicker">WHY EAH</span>
        <h2 className="trust__title">ليه تستخدم <span className="trust__accent">EAH</span>؟</h2>
      </header>

      <div className="trust__grid">
        {FEATURES.map((f, i) => (
          <div key={i} className="trust__card">
            <span className="trust__icon">{f.icon}</span>
            <strong className="trust__card-title">{f.title}</strong>
            <p className="trust__card-desc">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="trust__cta">
        <Link href="/auth" className="trust__cta-btn">ابدأ الآن — سجّل بسرعة</Link>
        <Link href="/about" className="trust__cta-link">اعرف أكتر عننا ←</Link>
      </div>
    </section>
  )
}
