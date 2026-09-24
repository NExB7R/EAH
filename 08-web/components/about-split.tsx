import Link from 'next/link'
import './about-split.css'

function IcCompass() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <polygon points="16 8 14 14 8 16 10 10 16 8" />
    </svg>
  )
}
function IcStore() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9l2-5h14l2 5" />
      <path d="M4 9v10h16V9" />
      <path d="M9 9v4a3 3 0 0 0 6 0V9" />
    </svg>
  )
}
function IcCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IcArrow() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

export default function AboutSplit() {
  return (
    <section className="asplit">
      <header className="asplit__head">
        <span className="asplit__kicker">ليه EAH؟</span>
        <h2 className="asplit__title">حاجتين مهمين — على السريع</h2>
        <p className="asplit__sub">منصة محلية في شبين القناطر — بتجمع الناس على الأماكن اللي حواليهم</p>
      </header>

      <div className="asplit__grid">
        <div className="asplit__card asplit__card--customer">
          <span className="asplit__icon"><IcCompass /></span>
          <div className="asplit__label">لعميل EAH</div>
          <h3 className="asplit__h">كل اللي حواليك — في مكان واحد</h3>
          <ul className="asplit__list">
            <li className="asplit__li"><IcCheck /> اكتشف مطاعم وصيدليات وماركت وتوصيل</li>
            <li className="asplit__li"><IcCheck /> شوف التقييمات والصور قبل ما تروح</li>
            <li className="asplit__li"><IcCheck /> اطلب على واتساب بضغطة</li>
            <li className="asplit__li"><IcCheck /> احفظ مفضلاتك وارجع ليها في ثانية</li>
          </ul>
          <Link href="/explore" className="asplit__cta">
            <IcArrow /> ابدأ الاستكشاف
          </Link>
        </div>

        <div className="asplit__card asplit__card--merchant">
          <span className="asplit__icon"><IcStore /></span>
          <div className="asplit__label">لصاحب النشاط</div>
          <h3 className="asplit__h">ظهورك المجاني — على طول</h3>
          <ul className="asplit__list">
            <li className="asplit__li"><IcCheck /> صفحة كاملة لنشاطك — صور ومنيو وفروع</li>
            <li className="asplit__li"><IcCheck /> استقبل الطلبات على واتساب</li>
            <li className="asplit__li"><IcCheck /> اعرف مين بيدخل صفحتك — إحصائيات حقيقية</li>
            <li className="asplit__li"><IcCheck /> بروز للمميزين — بدون أي عمولة</li>
          </ul>
          <Link href="/merchant/apply" className="asplit__cta">
            <IcArrow /> سجّل نشاطك مجاناً
          </Link>
        </div>
      </div>
    </section>
  )
}
