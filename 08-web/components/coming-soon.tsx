'use client'
import './coming-soon.css'

const FEATURES = [
  {
    emoji: '🚚',
    title: 'تتبّع طلبك لحظة بلحظة',
    body: 'اعرف طلبك فين بالظبط — من وقت الطلب لحد ما يوصل بابك.',
    badge: 'قريب',
  },
  {
    emoji: '🤖',
    title: 'بوت ذكي يطلب بدالك',
    body: 'اختار الأكل، البوت يجهزه ويرسله لمكانك بدون أي تعقيد.',
    badge: 'قريب',
  },
  {
    emoji: '💬',
    title: 'شات مباشر مع المكان',
    body: 'اسأل، اطلب، واتفق — كل ده جوّه EAH.',
    badge: 'قريب',
  },
  {
    emoji: '🎁',
    title: 'نظام نقاط أوفر',
    body: 'نقاط على كل تفاعل — تقييم، دعوة، أو طلب.',
    badge: 'قريب',
  },
  {
    emoji: '📍',
    title: 'خرائط تفاعلية',
    body: 'شوف الأماكن على الخريطة، اعرف المسافة والوقت المتوقع.',
    badge: 'قريب',
  },
  {
    emoji: '🌍',
    title: 'توسّع مناطق جديدة',
    body: 'من شبين القناطر لكل القرى. كل أسبوع مناطق جديدة.',
    badge: 'قريب',
  },
]

export default function ComingSoon() {
  return (
    <section className="cs">
      <header className="cs__head">
        <span className="cs__kicker">COMING SOON</span>
        <h2 className="cs__title">ميزات جاية قريب</h2>
        <p className="cs__sub">
          كل تحديث بيجيب ميزة جديدة — وكلها بدون أي تلاعب بالنقاط أو التجربة.
        </p>
      </header>

      <div className="cs__grid">
        {FEATURES.map((f, i) => (
          <article
            key={f.title}
            className="cs__card"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="cs__badge">{f.badge}</span>
            <span className="cs__emoji">{f.emoji}</span>
            <h3 className="cs__card-title">{f.title}</h3>
            <p className="cs__card-body">{f.body}</p>
          </article>
        ))}
      </div>

      <p className="cs__foot">
        تابعنا على واتساب عشان تعرف كل جديد أول بأول.
      </p>
    </section>
  )
}
