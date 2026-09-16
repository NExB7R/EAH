import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './advertise.css'

export const metadata = {
  title: 'إعلانات EAH',
  description: 'مساحات إعلانية على EAH — لمشروعك، لنشاطك، لأي حاجة عايز الناس تشوفها.',
}

const SPOTS = [
  {
    key: 'hero',
    emoji: '🎯',
    name: 'بانر الهيرو',
    desc: 'أول حاجة عين الزائر تشوفها على الرئيسية.',
    size: 'أول حاجة الزائر يشوفها',
    points: ['الصورة الكبيرة', 'في الهيرو فوق', 'أول حاجة العين تشوفها'],
    glow: '#E8C79A',
  },
  {
    key: 'feed',
    emoji: '📰',
    name: 'إعلان داخل الرئيسية',
    desc: 'يظهر بين أقسام (مميزين/مولعة/الجديد).',
    size: 'بتظهر بين الأقسام',
    points: ['بين الأقسام', 'يظهر بشكل طبيعي', 'بدون Pop-ups'],
    glow: '#A855F7',
  },
  {
    key: 'sidebar',
    emoji: '📌',
    name: 'شريط جانبي',
    desc: 'في الجانب الأيسر أثناء التصفح.',
    size: 'ثابتة في الرحلة',
    points: ['جانب الصفحة', 'ثابت في الرحلة', 'ما بيختفي'],
    glow: '#C084FC',
  },
  {
    key: 'search',
    emoji: '🔍',
    name: 'نتيجة بحث مميزة',
    desc: 'لما حد يدور على حاجة معينة — إنت أول واحد.',
    size: 'على كلمة معينة',
    points: ['على كلمة معينة', 'أول نتيجة', 'استهداف دقيق'],
    glow: '#FBBF24',
  },
]

const WHO = [
  { emoji: '🧁', title: 'Hand-made', body: 'مشاريع من البيت — حلويات، مشغولات، كروشيه.' },
  { emoji: '📱', title: 'Online', body: 'صفحات سوشيال ميديا، متاجر انلاين، ترويج.' },
  { emoji: '🏢', title: 'عقارات', body: 'شقق، محلات، مكاتب — في شبين والقرى.' },
  { emoji: '🛵', title: 'خدمات', body: 'توصيل، صيانة، دروس، صالونات.' },
  { emoji: '🎂', title: 'مناسبات', body: 'أفراح، حفلات، تنظيم أحداث.' },
  { emoji: '📚', title: 'تعليم', body: 'مراكز، دروس خصوصية، كورسات.' },
]

const STATS = [
  { num: '24/7', label: 'ظهور مستمر' },
  { num: '4 مساحات', label: 'تناسب كل ميزانية' },
  { num: '0 تعقيد', label: 'تحدد وأنت متطمن' },
]

export default function AdvertisePage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="adv">
        {/* Hero */}
        <section className="adv-hero">
          <div className="adv-hero__glow" aria-hidden />
          <span className="adv-hero__kicker">EAH • إعلانات</span>
          <h1 className="adv-hero__title">
            خلّي مكانك
            <br />
            <span className="adv-hero__title-accent">يظهر للكل</span>
          </h1>
          <p className="adv-hero__lead">
            مساحات إعلانية على EAH — <strong>منفصلة تماماً عن الباقات</strong>.<br/>
            تقدر تعلن لوحدك، من غير أي اشتراك تاني.
          </p>
          <div className="adv-hero__actions">
            <a href="https://wa.me/201012892806?text=عايز أعرف أسعار الإعلانات" target="_blank" rel="noreferrer" className="adv-btn adv-btn--primary">
              💬 اعرف الأسعار
            </a>
            <Link href="/pricing" className="adv-btn adv-btn--ghost">
              📦 شوف الباقات
            </Link>
          </div>
        </section>

        {/* Stat strip */}
        <section className="adv-stats">
          {STATS.map((s) => (
            <div key={s.label} className="adv-stat">
              <span className="adv-stat__num">{s.num}</span>
              <span className="adv-stat__label">{s.label}</span>
            </div>
          ))}
        </section>

        {/* Spots */}
        <section className="adv-section">
          <header className="adv-section__head">
            <span className="adv-section__kicker">المساحات المتاحة</span>
            <h2 className="adv-section__title">4 أماكن نار للظهور</h2>
            <p className="adv-section__sub">كل مساحة ليها موقعها، وميزتها، وسعرها حسب الطلب.</p>
          </header>
          <div className="adv-spots">
            {SPOTS.map((sp) => (
              <article key={sp.key} className="adv-spot" style={{ '--glow': sp.glow } as React.CSSProperties}>
                <span className="adv-spot__emoji">{sp.emoji}</span>
                <h3 className="adv-spot__name">{sp.name}</h3>
                <p className="adv-spot__desc">{sp.desc}</p>
                <span className="adv-spot__size">{sp.size}</span>
                <ul className="adv-spot__points">
                  {sp.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Who */}
        <section className="adv-section">
          <header className="adv-section__head">
            <span className="adv-section__kicker">يناسب مين</span>
            <h2 className="adv-section__title">أي حد عنده حاجة يقولها</h2>
          </header>
          <div className="adv-who">
            {WHO.map((w) => (
              <div key={w.title} className="adv-who__card">
                <span className="adv-who__emoji">{w.emoji}</span>
                <strong className="adv-who__title">{w.title}</strong>
                <span className="adv-who__body">{w.body}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Ad vs Package */}
        <section className="adv-compare">
          <div className="adv-compare__row">
            <div className="adv-compare__col adv-compare__col--ads">
              <h3>📢 إعلانات EAH</h3>
              <p className="adv-compare__lead">مساحة إعلانية في مكان محدد.</p>
              <ul>
                <li>تظهر لمستخدمين كتير</li>
                <li>مش لازم يكون عندك نشاط على EAH</li>
                <li>مش مرتبطة بأي باقة</li>
                <li>مدة محددة + عدّاد ظهور</li>
              </ul>
            </div>
            <div className="adv-compare__vs">VS</div>
            <div className="adv-compare__col adv-compare__col--pkg">
              <h3>📦 الباقات</h3>
              <p className="adv-compare__lead">نشاط كامل على EAH.</p>
              <ul>
                <li>صفحة خاصة بنشاطك</li>
                <li>منيو، عروض، أوردرات</li>
                <li>ميزات الشريك المدفوع</li>
                <li>30 يوم تجربة مجانية</li>
              </ul>
              <Link href="/pricing" className="adv-compare__cta">شوف الباقات ←</Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="adv-cta">
          <h2 className="adv-cta__title">جاهز تعلن معانا؟</h2>
          <p className="adv-cta__body">
            كلمنا على واتساب — نقولك الأسعار، والمساحات المتاحة، ونظبط كل حاجة في دقايق.
          </p>
          <a href="https://wa.me/201012892806?text=عايز أعلن على EAH" target="_blank" rel="noreferrer" className="adv-btn adv-btn--primary adv-btn--big">
            💬 كلمنا على واتساب
          </a>
          <p className="adv-cta__note">
            🇵🇸 5% من كل إعلان بيروح لدعم أهلنا في فلسطين — بدون أي زيادة عليك.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
