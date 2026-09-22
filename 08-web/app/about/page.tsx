
import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import EahLogo from '@/components/eah-logo'
import './about-2026.css'

export const metadata = {
  title: 'احنا مين',
  description: 'EAH — منصة مصرية من شبين القناطر. بنوصّل الناس بأماكنهم، وبنوصّل الأماكن بأصحابها.',
}

// ═══ Icons حصرية للأبوت ═══
const Ic = {
  shield: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>,
  mic: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="22"/></svg>,
  route: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h5a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5"/></svg>,
  bolt: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  star: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.6 6.2L21 9.27l-4.5 4.38L17.6 20 12 17l-5.6 3 1.1-6.35L3 9.27l6.4-1.07z"/></svg>,
  gift: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4"/><rect x="5" y="12" width="14" height="10"/><path d="M12 8v14M12 8c-1-3-4-3-4-1s3 1 4 1c1 0 4 1 4-1s-3-2-4 1z"/></svg>,
  rocket: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>,
  heart: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>,
  check: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
}

const PROMISES = [
  { icon: Ic.shield, title: 'بدون عمولة', body: 'العميل بيكلّم التاجر مباشر — إحنا مش في السكة' },
  { icon: Ic.mic, title: 'بنتكلم مصري', body: 'التطبيق بيفهم لهجتنا — اكتب زي ما بتتكلم' },
  { icon: Ic.route, title: 'محلي 100%', body: 'بدأنا من شبين القناطر — وكل قرار بياخده جارك' },
  { icon: Ic.bolt, title: 'طلب على واتساب', body: 'نص + صور + فويس نوت — يوصل للتاجر على طول' },
  { icon: Ic.star, title: 'مصداقية ثنائية', body: 'ثقة للعميل والتاجر — اللي يغلط يتحاسب' },
  { icon: Ic.gift, title: 'نقاط ومكافآت', body: 'كل تفاعل = نقاط — تنفعك بمميزات حقيقية' },
]

const CUSTOMER_PERKS = [
  'تصفّح كل الأماكن بفلتر ذكي',
  'تقييمات حقيقية من ناس زيك',
  'احفظ أماكنك المفضلة',
  'اطلب مباشر بدون وسيط',
  'اجمع نقاط مع كل تفاعل',
  'مصداقيتك بتفتحلك مميزات',
]

const MERCHANT_PERKS = [
  'صفحة كاملة بلوجو وصور ومنيو',
  'أوردرات على واتسابك مباشر',
  'صور بعلامة مائية EAH',
  'تقارير شهرية بأرقامك',
  '30 يوم تجربة بدون بطاقة',
  'فريق EAH معاك خطوة بخطوة',
]

export default function AboutPage() {
  return (
    <>
      <FloatingCapsuleHeader />

      <main className="ab2">
        {/* ═══ 1. HERO — أول لقاء (مختصر) ═══ */}
        <section className="ab2-hero">
          <div className="ab2-hero__glow" aria-hidden />
          <div className="ab2-hero__grid" aria-hidden />

          <div className="ab2-hero__inner">
            <div className="ab2-hero__logo">
              <EahLogo size="lg" variant="full" href="/" />
            </div>

            <span className="ab2-hero__badge">
              <span className="ab2-hero__badge-dot" />
              من قلب شبين القناطر
            </span>

            <h1 className="ab2-hero__title">
              اللي <em>نفسك</em> فيه ؟
            </h1>

            <p className="ab2-hero__lead">
              منصة مصرية بتوصّل الناس بأماكنهم المحلية —{' '}
              <strong>بدون وسيط، بدون عمولة، بقلب مصري</strong>.
            </p>

            <div className="ab2-hero__cta">
              <Link href="/explore" className="ab2-btn ab2-btn--primary">
                يلا ندور
                {Ic.arrow}
              </Link>
              <Link href="/merchant/apply" className="ab2-btn ab2-btn--ghost">
                سجّل نشاطك
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ 2. STORY — حكايتنا (3 أسطر) ═══ */}
        <section className="ab2-story">
          <div className="ab2-container">
            <h2 className="ab2-title">
              بدأنا من <em>شارع واحد</em>
            </h2>
            <p className="ab2-story__body">
              في 2026، نزلنا الشارع العمومي في شبين القناطر. لقينا مطاعم وصيدليات
              ومكاتب توصيل — كلهم جيران، بس محدش بيعرف يوصل لبعض صح.
              فقررنا نبني حاجة <strong>مصري بحت</strong> — تفهم لهجتنا، وتحب مكاننا.
            </p>
          </div>
        </section>

        {/* ═══ 3. PROMISES — 6 مميزات في كروت صغيرة ═══ */}
        <section className="ab2-promises">
          <div className="ab2-container">
            <div className="ab2-section-head">
              <span className="ab2-kicker">اللي بيميزنا</span>
              <h2 className="ab2-title">
                ست حاجات <em>مش هتلاقيها</em> في حتة تانية
              </h2>
            </div>

            <div className="ab2-promises__grid">
              {PROMISES.map((p, i) => (
                <article key={i} className={`ab2-promise ${i % 3 === 0 ? 'ab2-promise--gold' : 'ab2-promise--purple'}`}>
                  <span className="ab2-promise__icon">{p.icon}</span>
                  <h3 className="ab2-promise__title">{p.title}</h3>
                  <p className="ab2-promise__body">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 4. AUDIENCES — للعميل + للتاجر (جنب بعض) ═══ */}
        <section className="ab2-audiences">
          <div className="ab2-container">
            <div className="ab2-audiences__grid">
              {/* للعميل */}
              <article className="ab2-audience-card ab2-audience-card--customer">
                <span className="ab2-kicker ab2-kicker--purple">للعميل</span>
                <h3 className="ab2-audience-card__title">
                  كل حاجة <em>حواليك</em>
                </h3>
                <ul className="ab2-audience-card__list">
                  {CUSTOMER_PERKS.map((p, i) => (
                    <li key={i}>
                      <span className="ab2-check ab2-check--purple">{Ic.check}</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href="/explore" className="ab2-btn ab2-btn--primary ab2-btn--full">
                  ابدأ دلوقتي
                  {Ic.arrow}
                </Link>
              </article>

              {/* للتاجر */}
              <article className="ab2-audience-card ab2-audience-card--merchant">
                <span className="ab2-kicker ab2-kicker--gold">لصاحب النشاط</span>
                <h3 className="ab2-audience-card__title">
                  نشاطك يستاهل <em>مكان يليق بيه</em>
                </h3>
                <ul className="ab2-audience-card__list">
                  {MERCHANT_PERKS.map((p, i) => (
                    <li key={i}>
                      <span className="ab2-check ab2-check--gold">{Ic.check}</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href="/merchant/apply" className="ab2-btn ab2-btn--gold ab2-btn--full">
                  سجّل مجاناً
                  {Ic.arrow}
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* ═══ 5. FOR NEW PROJECTS — دعوة مختصرة ═══ */}
        <section className="ab2-newcomers">
          <div className="ab2-container">
            <div className="ab2-newcomers__inner">
              <div className="ab2-newcomers__glow" aria-hidden />
              <span className="ab2-kicker ab2-kicker--gold">للمشاريع الجديدة</span>
              <h2 className="ab2-newcomers__title">
                بتبدأ من الأول؟ <em>إحنا معاك</em>
              </h2>
              <p className="ab2-newcomers__lead">
                فكرة في دماغك؟ ورشة صغيرة؟ عربية توصيل؟ —{' '}
                <strong>متشيلش هم أي حاجة</strong>. سجّل مجاناً، وإحنا هنوصلك للناس.
              </p>
              <Link href="/merchant/apply" className="ab2-btn ab2-btn--gold ab2-btn--lg">
                ابعتلنا مشروعك
                {Ic.arrow}
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ 6. NUMBERS — 4 أرقام ═══ */}
        <section className="ab2-numbers">
          <div className="ab2-container">
            <div className="ab2-numbers__grid">
              <div className="ab2-number">
                <span className="ab2-number__value">0%</span>
                <span className="ab2-number__label">عمولة</span>
              </div>
              <div className="ab2-number">
                <span className="ab2-number__value">100%</span>
                <span className="ab2-number__label">مجاني للعميل</span>
              </div>
              <div className="ab2-number">
                <span className="ab2-number__value">30</span>
                <span className="ab2-number__label">يوم تجربة</span>
              </div>
              <div className="ab2-number">
                <span className="ab2-number__value">24/7</span>
                <span className="ab2-number__label">دعم فني</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 7. FINAL CTA — مختصر ═══ */}
        <section className="ab2-final">
          <div className="ab2-container">
            <div className="ab2-final__inner">
              <div className="ab2-final__glow" aria-hidden />
              <h2 className="ab2-final__title">
                اللي <em>نفسك فيه</em> على بعد خطوة
              </h2>
              <p className="ab2-final__lead">
                سواء بتدور على أكل، أو عندك نشاط جديد — EAH موجود عشانك.
              </p>
              <div className="ab2-final__cta">
                <Link href="/explore" className="ab2-btn ab2-btn--primary">
                  ابدأ تصفح
                  {Ic.arrow}
                </Link>
                <Link href="/merchant/apply" className="ab2-btn ab2-btn--gold">
                  سجّل نشاطك
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
