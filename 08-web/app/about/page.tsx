import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './about.css'

export const metadata = {
  title: 'نبذة عننا',
  description: 'EAH — منصة اكتشاف محلية بتبدأ من شبين القناطر وبتوصل لكل حتة.',
}

const STATS = [
  { num: '2026', label: 'سنة التأسيس', color: '#A855F7' },
  { num: '8', label: 'مناطق مستهدفة', color: '#E8C79A' },
  { num: '4', label: 'فئات رئيسية', color: '#C084FC' },
  { num: '100%', label: 'مجاني للعميل', color: '#FBBF24' },
]

const VALUES = [
  {
    emoji: '🎯',
    title: 'بنوصّلك الصح',
    body: 'بنفهم مزاجك، موقعك، وميزانيتك. وبنرشحلك الأماكن اللي فعلًا تناسبك — مش الأكثر دفعًا.',
  },
  {
    emoji: '💜',
    title: 'بنسمعك دايمًا',
    body: 'كل اقتراح، كل شكوى، وكل فكرة بتوصلنا. وبنبني على أساسها المنصة خطوة بخطوة.',
  },
  {
    emoji: '⚡',
    title: 'تجربة خفيفة',
    body: 'من غير تعقيد، ومن غير تسجيل طويل. بتبحث، بتلاقي، وبتواصل — في ثواني.',
  },
  {
    emoji: '🤝',
    title: 'دعم البيوت المحلية',
    body: 'بنخلي المطعم الصغير، والصيدلية، والماركت، ومكتب التوصيل — يوصلوا لناس أكتر.',
  },
]

const TIMELINE = [
  {
    year: '2026',
    title: 'البداية من شبين القناطر',
    body: 'الفكرة كانت بسيطة: ناس كتير في المدينة والريف مش لاقيين الأماكن القريبة منها بسهولة. EAH وُلدت عشان تحل ده.',
  },
  {
    year: 'الآن',
    title: 'بنتوسع منطقة منطقة',
    body: 'بنضيف مطاعم وصيدليات وماركتات ومكاتب توصيل — كل واحد بيتم اختياره ومناقشته قبل النشر.',
  },
  {
    year: 'قريب',
    title: 'توسّع أوسع + خدمات أذكى',
    body: 'بنشتغل على ترشيحات أدق، إشعارات ذكية، وأدوات تساعد التاجر يكبر معانا.',
  },
]

export default function AboutPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="ab">
        {/* Hero */}
        <section className="ab__hero">
          <div className="ab__hero-glow" aria-hidden />
          <span className="ab__kicker">ABOUT EAH</span>
          <h1 className="ab__title">
            منصة اكتشاف محلية،
            <br />
            <span className="ab__title-accent">بتحب المكان اللي فيه</span>
          </h1>
          <p className="ab__lead">
            EAH بدأت من شبين القناطر — هدفنا نوصل كل حد لأقرب مكان محتاجه،
            بأسهل طريقة، ومن غير أي تعقيد.
          </p>
          <div className="ab__hero-cta">
            <Link href="/explore" className="ab__btn ab__btn--primary">
              🔍 اكتشف الأماكن
            </Link>
            <Link href="/merchant-info" className="ab__btn ab__btn--ghost">
              🏪 لأصحاب الأنشطة
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="ab__stats">
          {STATS.map((s) => (
            <div key={s.label} className="ab__stat">
              <span className="ab__stat-num" style={{ color: s.color }}>
                {s.num}
              </span>
              <span className="ab__stat-label">{s.label}</span>
            </div>
          ))}
        </section>

        {/* Story */}
        <section className="ab__section">
          <header className="ab__section-head">
            <span className="ab__section-kicker">قصتنا</span>
            <h2 className="ab__section-title">بدأنا من فكرة صغيرة</h2>
          </header>
          <div className="ab__story">
            <p>
              في شبين القناطر والقرى حواليها، الوصول لمطعم قريب أو صيدلية مفتوحة أو ماركت
              فيه احتياجاتك — كان محتاج لفات كتير أو سؤال لناس. EAH جت عشان تختصر كل ده.
            </p>
            <p>
              بنجمع الأماكن المحلية في مكان واحد، بنراجعها بنفسنا، وبنقدمها بشكل مرتب
              وسهل. والعميل — دايمًا مجانًا.
            </p>
            <p>
              المنصة بتكبر منطقة منطقة، وكل مكان بينضم لـ EAH بيكون مضاف بعناية — مش
              مجرد رقم في قايمة.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="ab__section">
          <header className="ab__section-head">
            <span className="ab__section-kicker">قيمنا</span>
            <h2 className="ab__section-title">4 مبادئ بنمشي عليها</h2>
          </header>
          <div className="ab__values">
            {VALUES.map((v) => (
              <article key={v.title} className="ab__value">
                <span className="ab__value-emoji">{v.emoji}</span>
                <h3 className="ab__value-title">{v.title}</h3>
                <p className="ab__value-body">{v.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="ab__section">
          <header className="ab__section-head">
            <span className="ab__section-kicker">الرحلة</span>
            <h2 className="ab__section-title">فين إحنا وفين رايحين</h2>
          </header>
          <div className="ab__timeline">
            {TIMELINE.map((t, i) => (
              <article key={i} className="ab__tl-item">
                <div className="ab__tl-dot" aria-hidden />
                <div className="ab__tl-year">{t.year}</div>
                <div className="ab__tl-content">
                  <h3 className="ab__tl-title">{t.title}</h3>
                  <p className="ab__tl-body">{t.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="ab__cta">
          <h2 className="ab__cta-title">جاهز تبدأ معانا؟</h2>
          <p className="ab__cta-body">
            لو بتدور على مكان، أو عندك نشاط وعايز يوصل لناس أكتر — EAH هي المكان الصح.
          </p>
          <div className="ab__cta-actions">
            <Link href="/contact" className="ab__btn ab__btn--primary">
              💬 تواصل معنا
            </Link>
            <Link href="/merchant/apply" className="ab__btn ab__btn--ghost">
              🏪 سجّل نشاطك
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
