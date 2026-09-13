import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './about.css'

export const metadata = {
  title: 'نبذة عننا',
  description: 'EAH — منصة اكتشاف محلية بتبدأ من شبين القناطر وتوصل لكل حتة.',
}

const STATS = [
  { num: '2026', label: 'سنة التأسيس' },
  { num: '+10', label: 'أنشطة مسجلة' },
  { num: '4', label: 'فئات رئيسية' },
  { num: '100%', label: 'مجاني للعميل' },
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
      <main className="about">
        {/* Hero */}
        <section className="about__hero">
          <div className="about__hero-inner">
            <span className="about__kicker">ABOUT EAH</span>
            <h1 className="about__title">
              نبذة عننا
            </h1>
            <p className="about__lead">
              EAH منصة اكتشاف محلية بدأت من شبين القناطر — هدفنا نوصل كل حد
              لأقرب مكان محتاجه، بأسهل طريقة، ومن غير أي تعقيد.
            </p>
            <div className="about__hero-cta">
              <Link href="/explore" className="about__btn about__btn--primary">
                اكتشف الأماكن
              </Link>
              <Link href="/merchant/apply" className="about__btn about__btn--ghost">
                سجّل نشاطك
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="about__stats">
          {STATS.map((s) => (
            <div key={s.label} className="about__stat">
              <span className="about__stat-num">{s.num}</span>
              <span className="about__stat-label">{s.label}</span>
            </div>
          ))}
        </section>

        {/* Story */}
        <section className="about__section">
          <header className="about__section-head">
            <span className="about__section-kicker">قصتنا</span>
            <h2 className="about__section-title">بدأنا من فكرة صغيرة</h2>
          </p>
          <div className="about__story">
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
        <section className="about__section">
          <header className="about__section-head">
            <span className="about__section-kicker">قيمنا</span>
            <h2 className="about__section-title">إحنا ماشيين على 4 مبادئ</h2>
          </header>
          <div className="about__values">
            {VALUES.map((v) => (
              <article key={v.title} className="about__value">
                <span className="about__value-emoji">{v.emoji}</span>
                <h3 className="about__value-title">{v.title}</h3>
                <p className="about__value-body">{v.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="about__section">
          <header className="about__section-head">
            <span className="about__section-kicker">الرحلة</span>
            <h2 className="about__section-title">فين إحنا وفين رايحين</h2>
          </header>
          <div className="about__timeline">
            {TIMELINE.map((t, i) => (
              <article key={i} className="about__tl-item">
                <div className="about__tl-year">{t.year}</div>
                <div className="about__tl-content">
                  <h3 className="about__tl-title">{t.title}</h3>
                  <p className="about__tl-body">{t.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="about__cta">
          <h2 className="about__cta-title">جاهز تبدأ معانا؟</h2>
          <p className="about__cta-body">
            لو بتدور على مكان، أو عندك نشاط وعايز يوصل لناس أكتر — EAH هي المكان الصح.
          </p>
          <div className="about__cta-actions">
            <Link href="/contact" className="about__btn about__btn--primary">
              تواصل معنا
            </Link>
            <Link href="/merchant/apply" className="about__btn about__btn--ghost">
              سجّل نشاطك
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
