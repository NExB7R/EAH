import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'
import EahLogo from '@/components/eah-logo'
import './about-2026.css'

export const metadata = {
  title: 'احنا مين',
  description:
    'EAH — حكاية منصة مصرية اتولدت في شبين القناطر. بنوصّل الناس بأماكنهم، وبنوصّل الأماكن بأصحابها — بدون وسيط، بدون عمولة، بقلب مصري.',
}

// ═══════════════════════════════════════════════════════════
// أيقونات حصرية لصفحة الأبوت — مش موجودة في أي حتة تانية
// ═══════════════════════════════════════════════════════════
const IcSpark = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    <circle cx="12" cy="12" r="4" />
  </svg>
)
const IcRoute = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" />
    <circle cx="18" cy="5" r="3" />
    <path d="M9 19h5a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5" />
  </svg>
)
const IcHeart2 = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const IcHandshake = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 17l-1.5 1.5a2.12 2.12 0 0 1-3-3l4-4a2 2 0 0 1 3 0l3 3" />
    <path d="M18 13.5l-2.5 2.5a2.12 2.12 0 0 1-3-3l2-2" />
    <path d="M2 10l4-4 4 4M22 10l-4-4-4 4" />
  </svg>
)
const IcStar4 = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.6 6.2L21 9.27l-4.5 4.38L17.6 20 12 17l-5.6 3 1.1-6.35L3 9.27l6.4-1.07z" />
  </svg>
)
const IcBolt2 = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
)
const IcShield2 = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)
const IcMic2 = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <line x1="12" y1="18" x2="12" y2="22" />
  </svg>
)
const IcGift2 = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="4" />
    <rect x="5" y="12" width="14" height="10" />
    <path d="M12 8v14M12 8c-1-3-4-3-4-1s3 1 4 1c1 0 4 1 4-1s-3-2-4 1z" />
  </svg>
)
const IcRocket2 = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
)
const IcArrowLeft2 = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)
const IcCheck2 = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function AboutPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />

      <main className="ab2">
        {/* ═══════════════════════════════════════════════════
           1. HERO — أول لقاء
           ═══════════════════════════════════════════════════ */}
        <section className="ab2-hero">
          <div className="ab2-hero__glow" aria-hidden />
          <div className="ab2-hero__grid" aria-hidden />

          <div className="ab2-hero__inner">
            <div className="ab2-hero__logo">
              <EahLogo size="xl" variant="full" href="/" />
            </div>

            <span className="ab2-hero__badge">
              <span className="ab2-hero__badge-dot" />
              من قلب شبين القناطر
            </span>

            <h1 className="ab2-hero__title">
              اللي <em>نفسك</em> فيه ؟
            </h1>

            <p className="ab2-hero__lead">
              إحنا مش تطبيق تاني. إحنا <strong>حكاية مصرية</strong> بدأت من
              شارع صغير في شبين القناطر، وحلمها إن كل جار يلاقي اللي هو عايزه
              على بعد خطوة — بدون لف ودوران، وبدون وسيط، وبدون عمولات.
            </p>

            <div className="ab2-hero__cta">
              <Link href="/explore" className="ab2-btn ab2-btn--primary">
                يلا ندور سوا
                <IcArrowLeft2 />
              </Link>
              <Link href="#story" className="ab2-btn ab2-btn--ghost">
                اقرا حكايتنا
              </Link>
            </div>

            <div className="ab2-hero__stats">
              <div className="ab2-hero__stat">
                <span className="ab2-hero__stat-num">100%</span>
                <span className="ab2-hero__stat-label">مجاني للعميل</span>
              </div>
              <div className="ab2-hero__stat-divider" aria-hidden />
              <div className="ab2-hero__stat">
                <span className="ab2-hero__stat-num">0%</span>
                <span className="ab2-hero__stat-label">عمولة على الأوردرات</span>
              </div>
              <div className="ab2-hero__stat-divider" aria-hidden />
              <div className="ab2-hero__stat">
                <span className="ab2-hero__stat-num">30</span>
                <span className="ab2-hero__stat-label">يوم تجربة للتاجر</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
           2. STORY — حكايتنا
           ═══════════════════════════════════════════════════ */}
        <section id="story" className="ab2-story">
          <div className="ab2-container">
            <header className="ab2-section-head">
              <span className="ab2-kicker">حكايتنا</span>
              <h2 className="ab2-title">
                بدأنا من <em>شارع واحد</em> — وحلم كبير
              </h2>
            </header>

            <div className="ab2-story__body">
              <div className="ab2-story__text">
                <p>
                  في 2026، نزلت من بيتي في شبين القناطر، ومشيت الشارع
                  العمومي. بصيت حواليا لقيت <strong>مطاعم، صيدليات،
                  ماركتات، ومكاتب توصيل</strong> — كلهم جيران، كلهم
                  بيعرفوا بعض، بس محدش بيعرف يوصل لبعض صح.
                </p>
                <p>
                  كل واحد فينا بيدور على مكان وهو حاطط ٣ أو ٤ تطبيقات على
                  موبايله — وكلهم بيتكلموا لغة غريبة، ومش فاهمين اللهجة،
                  ولا عارفين يعني إيه "اللي نفسك فيه".
                </p>
                <p className="ab2-story__highlight">
                  فقررت أبني حاجة <strong>مصري بحت</strong> — تفهم لهجتنا،
                  وتحب مكاننا، وبتتكلم بلغة أهل البلد.
                </p>
                <p>
                  EAH مش "نسخة من تالابايت" ولا "المنصة المصرية الجديدة".
                  EAH هي <strong>الأخ اللي بيقولك فين تلاقي اللي نفسك
                  فيه</strong> — بدون لف، بدون كلام زيادة، وبدون
                  عمولات على حد.
                </p>
              </div>

              <aside className="ab2-story__quote">
                <div className="ab2-story__quote-mark">"</div>
                <p className="ab2-story__quote-text">
                  مش عايزين نبني أكبر منصة في مصر. عايزين نبني
                  <strong> أنضف منصة في مصر</strong> — نظيفة من العمولة،
                  نظيفة من الوسطاء، نظيفة من الكلام الفاضي.
                </p>
                <div className="ab2-story__quote-author">
                  <span className="ab2-story__quote-sign">NourEldin B7R</span>
                  <span className="ab2-story__quote-role">مؤسس EAH</span>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
           3. PROMISES — اللي إحنا مختلفين بيه
           ═══════════════════════════════════════════════════ */}
        <section className="ab2-promises">
          <div className="ab2-container">
            <header className="ab2-section-head">
              <span className="ab2-kicker">اللي بيميزنا</span>
              <h2 className="ab2-title">
                سبع حاجات <em>مش هتلاقيها</em> في حتة تانية
              </h2>
            </header>

            <div className="ab2-promises__grid">
              <article className="ab2-promise ab2-promise--gold">
                <span className="ab2-promise__icon"><IcShield2 /></span>
                <h3 className="ab2-promise__title">مفيش عمولة خالص</h3>
                <p className="ab2-promise__body">
                  العميل بيكلّم التاجر <strong>مباشر</strong>. إحنا
                  مش داخلين في السكة — لا على اليمين ولا على الشمال.
                </p>
              </article>

              <article className="ab2-promise ab2-promise--purple">
                <span className="ab2-promise__icon"><IcMic2 /></span>
                <h3 className="ab2-promise__title">بنتكلم مصري</h3>
                <p className="ab2-promise__body">
                  تطبيقنا يفهم <strong>لهجتنا</strong> — تكتب "عايز أكل
                  سمك" وهو يفهمك من غير ما تتكلم فصحى.
                </p>
              </article>

              <article className="ab2-promise ab2-promise--gold">
                <span className="ab2-promise__icon"><IcRoute /></span>
                <h3 className="ab2-promise__title">محلي 100%</h3>
                <p className="ab2-promise__body">
                  بدأنا من شبين القناطر — والحمد لله في توسّع. بس
                  كل قرار بياخده <strong>جارك</strong>، مش شركة بعيدة.
                </p>
              </article>

              <article className="ab2-promise ab2-promise--purple">
                <span className="ab2-promise__icon"><IcBolt2 /></span>
                <h3 className="ab2-promise__title">طلب على واتساب</h3>
                <p className="ab2-promise__body">
                  كتب الأوردر، ابعت صورة، سجّل فويس نوت — وكل ده يوصل
                  للتاجر <strong>على واتساب مباشر</strong>.
                </p>
              </article>

              <article className="ab2-promise ab2-promise--gold">
                <span className="ab2-promise__icon"><IcStar4 /></span>
                <h3 className="ab2-promise__title">مصداقية ثنائية</h3>
                <p className="ab2-promise__body">
                  العميل عنده مصداقية، والتاجر كمان. <strong>العدالة
                  كاملة</strong> — اللي يغلط يتحاسب، اللي يستاهل يترقّى.
                </p>
              </article>

              <article className="ab2-promise ab2-promise--purple">
                <span className="ab2-promise__icon"><IcGift2 /></span>
                <h3 className="ab2-promise__title">نقاط ومكافآت</h3>
                <p className="ab2-promise__body">
                  كل تفاعل = نقاط. النقاط بتيجي بمميزات حقيقية —
                  كوبونات، أولوية، <strong>مش بس رقم في الفراغ</strong>.
                </p>
              </article>

              <article className="ab2-promise ab2-promise--gold ab2-promise--wide">
                <span className="ab2-promise__icon"><IcSpark /></span>
                <h3 className="ab2-promise__title">مجاني للأبد للعميل</h3>
                <p className="ab2-promise__body">
                  مش هتدفع جنيه عشان تدور، تطلب، تقيّم، أو تحفظ حاجة.
                  إحنا بنكسب من <strong>شراكات مع التجار</strong> — مش
                  من جيب العميل.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
           4. FOR CUSTOMERS — للعميل
           ═══════════════════════════════════════════════════ */}
        <section className="ab2-audience ab2-audience--customer">
          <div className="ab2-container">
            <div className="ab2-audience__grid">
              <div className="ab2-audience__content">
                <span className="ab2-kicker ab2-kicker--gold">للعميل</span>
                <h2 className="ab2-audience__title">
                  إنت بتدور على إيه؟ <em>احنا هنجيبهولك</em>
                </h2>
                <p className="ab2-audience__lead">
                  EAH مش بس تطبيق — EAH هو الجار اللي بيعرف كل حاجة في
                  المنطقة. عايز أكل؟ عندنا. عايز دوا في نص الليل؟
                  عندنا. عايز تلاقي توصيل في وقت متأخر؟ عندنا.
                </p>

                <ul className="ab2-list">
                  <li><span className="ab2-list__check"><IcCheck2 /></span> <strong>تصفح كل الأماكن</strong> حواليك بفلتر ذكي</li>
                  <li><span className="ab2-list__check"><IcCheck2 /></span> <strong>تقييمات حقيقية</strong> من ناس زيك — مش شراكات مدفوعة</li>
                  <li><span className="ab2-list__check"><IcCheck2 /></span> <strong>احفظ الأماكن المفضلة</strong> — وارجعلها من أي جهاز</li>
                  <li><span className="ab2-list__check"><IcCheck2 /></span> <strong>اطلب مباشر</strong> على واتساب المكان — بدون وسيط</li>
                  <li><span className="ab2-list__check"><IcCheck2 /></span> <strong>اجمع نقاط</strong> مع كل تفاعل — واستبدلها بمميزات</li>
                  <li><span className="ab2-list__check"><IcCheck2 /></span> <strong>مصداقيتك بتحميك</strong> — عميل موثوق بياخد أولوية في الرد</li>
                </ul>

                <Link href="/explore" className="ab2-btn ab2-btn--primary">
                  يلا نبدأ
                  <IcArrowLeft2 />
                </Link>
              </div>

              <div className="ab2-audience__visual" aria-hidden>
                <div className="ab2-orbit">
                  <span className="ab2-orbit__ring ab2-orbit__ring--1" />
                  <span className="ab2-orbit__ring ab2-orbit__ring--2" />
                  <span className="ab2-orbit__ring ab2-orbit__ring--3" />
                  <span className="ab2-orbit__dot ab2-orbit__dot--1" />
                  <span className="ab2-orbit__dot ab2-orbit__dot--2" />
                  <span className="ab2-orbit__dot ab2-orbit__dot--3" />
                  <span className="ab2-orbit__core">
                    <IcHeart2 />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
           5. FOR MERCHANTS — لأصحاب الأنشطة
           ═══════════════════════════════════════════════════ */}
        <section className="ab2-audience ab2-audience--merchant">
          <div className="ab2-container">
            <div className="ab2-audience__grid ab2-audience__grid--reverse">
              <div className="ab2-audience__content">
                <span className="ab2-kicker ab2-kicker--purple">لأصحاب الأنشطة</span>
                <h2 className="ab2-audience__title">
                  نشاطك يستاهل <em>مكان يليق بيه</em>
                </h2>
                <p className="ab2-audience__lead">
                  عندك مطعم؟ صيدلية؟ ماركت؟ مكتب توصيل؟ عندك مشروع
                  جديد محتاج فرصة؟ EAH بيديك <strong>صفحة كاملة</strong>
                  بلوجو، صور، منيو، أوقات عمل — كل حاجة من غير ما تدفع
                  جنيه في الأول.
                </p>

                <ul className="ab2-list">
                  <li><span className="ab2-list__check"><IcCheck2 /></span> <strong>صفحة كاملة</strong> بلوجو، غلاف، صور، ومنيو</li>
                  <li><span className="ab2-list__check"><IcCheck2 /></span> <strong>أوردرات مباشرة</strong> على واتسابك — بدون وسيط</li>
                  <li><span className="ab2-list__check"><IcCheck2 /></span> <strong>صور بعلامة مائية</strong> — احمي هويتك البصرية</li>
                  <li><span className="ab2-list__check"><IcCheck2 /></span> <strong>تقارير شهرية</strong> — تعرف مؤشراتك وتخطط للجاي</li>
                  <li><span className="ab2-list__check"><IcCheck2 /></span> <strong>مصداقيتك تبني ثقة</strong> — العميل يعرف إنك جدير</li>
                  <li><span className="ab2-list__check"><IcCheck2 /></span> <strong>30 يوم تجربة مجانية</strong> — بدون بطاقة، بدون التزام</li>
                </ul>

                <div className="ab2-audience__cta-row">
                  <Link href="/merchant/apply" className="ab2-btn ab2-btn--gold">
                    سجّل نشاطك
                    <IcArrowLeft2 />
                  </Link>
                  <Link href="/pricing" className="ab2-btn ab2-btn--ghost">
                    شوف الباقات
                  </Link>
                </div>
              </div>

              <div className="ab2-audience__visual" aria-hidden>
                <div className="ab2-orbit ab2-orbit--gold">
                  <span className="ab2-orbit__ring ab2-orbit__ring--1" />
                  <span className="ab2-orbit__ring ab2-orbit__ring--2" />
                  <span className="ab2-orbit__ring ab2-orbit__ring--3" />
                  <span className="ab2-orbit__dot ab2-orbit__dot--1" />
                  <span className="ab2-orbit__dot ab2-orbit__dot--2" />
                  <span className="ab2-orbit__dot ab2-orbit__dot--3" />
                  <span className="ab2-orbit__core">
                    <IcRocket2 />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
           6. FOR NEW PROJECTS — دعوة للمشاريع الجديدة
           ═══════════════════════════════════════════════════ */}
        <section className="ab2-newcomers">
          <div className="ab2-container">
            <div className="ab2-newcomers__inner">
              <div className="ab2-newcomers__glow" aria-hidden />

              <span className="ab2-kicker ab2-kicker--gold">للمشاريع الجديدة</span>

              <h2 className="ab2-newcomers__title">
                لسه بتبدأ؟ <em>إحنا معاك</em>
              </h2>

              <p className="ab2-newcomers__lead">
                عندك مشروع جديد؟ فكرة في دماغك؟ ورشة صغيرة؟
                عربية توصيل؟ طاولة فطار؟
                <strong> متشيلش هم أي حاجة</strong>.
                EAH بيدي المشاريع الجديدة فرصتها الحقيقية —
                بدون ما تدفع، وبدون ما تشيل هم التسويق.
              </p>

              <div className="ab2-newcomers__pillars">
                <div className="ab2-newcomers__pillar">
                  <span className="ab2-newcomers__pillar-icon"><IcSpark /></span>
                  <span className="ab2-newcomers__pillar-label">ظهور مجاني</span>
                  <span className="ab2-newcomers__pillar-hint">في الرئيسية والاستكشاف</span>
                </div>
                <div className="ab2-newcomers__pillar">
                  <span className="ab2-newcomers__pillar-icon"><IcHandshake /></span>
                  <span className="ab2-newcomers__pillar-label">إحنا معاك</span>
                  <span className="ab2-newcomers__pillar-hint">نظبطلك الصور والكلام</span>
                </div>
                <div className="ab2-newcomers__pillar">
                  <span className="ab2-newcomers__pillar-icon"><IcRocket2 /></span>
                  <span className="ab2-newcomers__pillar-label">بنكبر معاك</span>
                  <span className="ab2-newcomers__pillar-hint">أدوات بتكبر مع مشروعك</span>
                </div>
              </div>

              <div className="ab2-newcomers__cta">
                <Link href="/merchant/apply" className="ab2-btn ab2-btn--gold">
                  ابعتلنا مشروعك
                  <IcArrowLeft2 />
                </Link>
                <Link href="/projects" className="ab2-btn ab2-btn--ghost">
                  شوف المشاريع الجديدة
                </Link>
              </div>

              <p className="ab2-newcomers__note">
                * مش محتاج بطاقة ولا التزام — محتاج بس فكرة، واحنا هنساعدك تكمل.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
           7. NUMBERS — أرقامنا
           ═══════════════════════════════════════════════════ */}
        <section className="ab2-numbers">
          <div className="ab2-container">
            <header className="ab2-section-head">
              <span className="ab2-kicker">أرقام بتحكي</span>
              <h2 className="ab2-title">
                مش كلام — <em>حقايق</em>
              </h2>
            </header>

            <div className="ab2-numbers__grid">
              <div className="ab2-number">
                <span className="ab2-number__value">0%</span>
                <span className="ab2-number__label">عمولة على أي أوردر</span>
                <span className="ab2-number__hint">مش هتدفع جنيه زيادة</span>
              </div>
              <div className="ab2-number">
                <span className="ab2-number__value">100%</span>
                <span className="ab2-number__label">مجاني للعميل</span>
                <span className="ab2-number__hint">للأبد — بدون اشتراكات</span>
              </div>
              <div className="ab2-number">
                <span className="ab2-number__value">30</span>
                <span className="ab2-number__label">يوم تجربة للتاجر</span>
                <span className="ab2-number__hint">بدون بطاقة، بدون التزام</span>
              </div>
              <div className="ab2-number">
                <span className="ab2-number__value">24/7</span>
                <span className="ab2-number__label">دعم فني</span>
                <span className="ab2-number__hint">على واتساب، رد سريع</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
           8. VALUES — قيمنا
           ═══════════════════════════════════════════════════ */}
        <section className="ab2-values">
          <div className="ab2-container">
            <header className="ab2-section-head">
              <span className="ab2-kicker">قيمنا</span>
              <h2 className="ab2-title">
                اللي <em>بنؤمن</em> بيه
              </h2>
            </header>

            <div className="ab2-values__grid">
              <div className="ab2-value">
                <span className="ab2-value__num">01</span>
                <h3 className="ab2-value__title">الشفافية قبل أي حاجة</h3>
                <p className="ab2-value__body">
                  مفيش "شروط خفية"، مفيش "بعدين نشوف".
                  كل حاجة واضحة من الأول.
                </p>
              </div>
              <div className="ab2-value">
                <span className="ab2-value__num">02</span>
                <h3 className="ab2-value__title">الجار قبل التطبيق</h3>
                <p className="ab2-value__body">
                  بنبني مع الناس، مش عليهم.
                  كل شريك في EAH هو جارنا الأول.
                </p>
              </div>
              <div className="ab2-value">
                <span className="ab2-value__num">03</span>
                <h3 className="ab2-value__title">اللهجة هي الهوية</h3>
                <p className="ab2-value__body">
                  مفيش فصحى متكلفة. بنتكلم زي ما بنتكلم في البيت،
                  وبنفهم زي ما بنفهم.
                </p>
              </div>
              <div className="ab2-value">
                <span className="ab2-value__num">04</span>
                <h3 className="ab2-value__title">العدل مش شعار</h3>
                <p className="ab2-value__body">
                  العميل عنده حقوق، والتاجر كمان. مفيش طرف أقوى
                  من التاني في EAH.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
           9. FINAL CTA — يلا نبدأ
           ═══════════════════════════════════════════════════ */}
        <section className="ab2-final">
          <div className="ab2-container">
            <div className="ab2-final__inner">
              <div className="ab2-final__glow" aria-hidden />

              <span className="ab2-final__kicker">يلا نبدأ</span>
              <h2 className="ab2-final__title">
                مستني إيه؟ <em>اللي نفسك فيه</em> على بعد خطوة
              </h2>
              <p className="ab2-final__lead">
                سواء كنت بتدور على أكل، أو عندك نشاط جديد،
                أو لسه بتفكر — EAH موجود عشانك.
              </p>

              <div className="ab2-final__cta">
                <Link href="/explore" className="ab2-btn ab2-btn--primary ab2-btn--lg">
                  ابدأ تصفح
                  <IcArrowLeft2 />
                </Link>
                <Link href="/merchant/apply" className="ab2-btn ab2-btn--gold ab2-btn--lg">
                  سجّل نشاطك
                  <IcArrowLeft2 />
                </Link>
              </div>

              <div className="ab2-final__contact">
                <span className="ab2-final__contact-label">عايز تكلمنا؟</span>
                <a
                  href="https://wa.me/201012892806"
                  target="_blank"
                  rel="noreferrer"
                  className="ab2-final__contact-link"
                >
                  واتساب المسئول
                </a>
                <span className="ab2-final__contact-divider">·</span>
                <a
                  href="https://facebook.com/eah.eg"
                  target="_blank"
                  rel="noreferrer"
                  className="ab2-final__contact-link"
                >
                  صفحة فيسبوك
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
