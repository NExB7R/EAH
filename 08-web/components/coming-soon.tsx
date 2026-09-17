'use client'
import './coming-soon.css'

const FEATURES = [
  {
    
    title: 'تتبّع طلبك لحظة بلحظة',
    body: 'اعرف طلبك فين بالظبط — من وقت الطلب لحد ما يوصل بابك.',
    badge: 'قريب',
    highlight: true,
  },
  {
    
    title: 'بوت ذكي يطلب بدالك',
    body: 'اختار الأكل، البوت يجهزه ويرسله لمكانك بدون أي تعقيد.',
    badge: 'قريب',
    highlight: true,
  },
  {
    
    title: 'شات مباشر مع المكان',
    body: 'اسأل، اطلب، واتفق — كل ده جوّه EAH.',
    badge: 'قريب',
  },
  {
    
    title: 'نظام نقاط أوفر',
    body: 'نقاط على كل تفاعل — تقييم، دعوة، أو طلب.',
    badge: 'قريب',
  },
  {
    
    title: 'خرائط تفاعلية',
    body: 'شوف الأماكن على الخريطة، اعرف المسافة والوقت المتوقع.',
    badge: 'قريب',
  },
  {
    
    title: 'توسّع مناطق جديدة',
    body: 'من شبين القناطر لكل القرى. كل أسبوع مناطق جديدة.',
    badge: 'قريب',
  },
]

export default function ComingSoon() {
  return (
    <section className="cs">
      <header className="cs__head">
        <span className="cs__kicker">قريب أوي</span>
        <h2 className="cs__title">ميزات جاية قريب</h2>
        <p className="cs__sub">
          كل تحديث بيجيب ميزة جديدة — وكلها بدون أي تلاعب بالنقاط أو التجربة.
        </p>
      </header>

      <div className="cs__grid">
        {FEATURES.map((f, i) => (
          <article
            key={f.title}
            className={`cs__card ${f.highlight ? 'cs__card--highlight' : ''}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="cs__badge">{f.badge}</span>
            
            <h3 className="cs__card-title">{f.title}</h3>
            <p className="cs__card-body">{f.body}</p>
          </article>
        ))}
      </div>

      <div className="cs__cta-row">
        <a href="/merchant-info" className="cs__cta cs__cta--owner">
          🏪 عندك نشاط؟ اعرف أكتر
        </a>
        <a
          href="/support-palestine"
          className="cs__cta cs__cta--palestine"
        >
          🇵🇸 فلسطين في القلب
        </a>
        <a
          href="https://wa.me/201012892806"
          target="_blank"
          rel="noreferrer"
          className="cs__cta"
        >
          💬 تابع واتساب
        </a>
      </div>
    </section>
  )
}
