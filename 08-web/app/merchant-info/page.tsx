import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './merchant-info.css'

export const metadata = {
  title: 'ليه تسجل نشاطك على EAH؟',
  description: 'اكتشف مميزات EAH لأصحاب الأنشطة — عرض مجاني، تحليلات، ردود على التقييمات، وباقة مميزة اختيارية.',
}

const FREE_BENEFITS = [
  { title: 'عرض مجاني بالكامل', body: 'سجّل نشاطك واعرضه لآلاف العملاء بدون أي رسوم.' },
  { title: 'تحليلات نشاطك', body: 'اعرف كام حد شاف نشاطك، وكام حد كشف رقمك.' },
  { title: 'رد على التقييمات', body: 'تواصل مع عملائك مباشرة ورد على تعليقاتهم.' },
  { title: 'QR Code للنشاط', body: 'اطبع QR على الفاتورة أو المحل — العملاء يكتشفوك بسهولة.' },
  { title: 'عروض وخصومات', body: 'انشر عروضك ووصل لعملاء جداد.' },
  { title: 'تقييمات موثوقة', body: 'تقييمات حقيقية من عملاء موثقين — بدون تلاعب.' },
]

const PREMIUM_BENEFITS = [
  { title: 'ظهور أول في البحث', body: 'نشاطك يظهر في المقدمة على المنصة.' },
  { title: 'شارة ذهبية', body: 'شارة مميزة بجانب اسم نشاطك تعطي مصداقية أعلى.' },
  { title: 'معرض عروض مميز', body: 'قسم خاص لعروضك في الصفحة الرئيسية.' },
  { title: 'إشعارات فورية', body: 'تنبيهات لحظية عن كل تقييم أو تفاعل.' },
  { title: 'تحليلات متقدمة', body: 'تقارير تفصيلية عن الأداء والاتجاهات.' },
  { title: 'إعلانات مخصصة', body: 'مساحات إعلانية على الصفحة الرئيسية.' },
]

const FAQ = [
  { q: 'هل التسجيل مجاني؟', a: 'نعم، بالكامل. سجّل نشاطك، واعرضه، واديره بدون أي رسوم.' },
  { q: 'إيه الفرق بين الباقة المجانية والمميزة؟', a: 'المجانية بتوفر ظهور أساسي وتقييمات. المميزة بتدي ظهور أول، شارة ذهبية، معرض عروض، وإشعارات فورية.' },
  { q: 'التجربة المميزة بتكلف كام؟', a: 'تجربة شهر كامل مجاناً. بعدها تقرر تكمل أو ترجع للباقة المجانية.' },
  { q: 'محتاج أعرف أكتر؟', a: 'كلّمنا على واتساب وهنشرحلك كل التفاصيل اللي تناسب نشاطك.' },
]

const WA = 'https://wa.me/201012892806?text=' +
  encodeURIComponent('مرحباً EAH، عندي نشاط وعايز أعرف تفاصيل أكثر')

export default function MerchantInfoPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="mi">
        <section className="mi__hero">
          <span className="mi__kicker">لأصحاب الأنشطة</span>
          <h1 className="mi__title">ليه تسجل نشاطك على EAH؟</h1>
          <p className="mi__lead">
            عرض مجاني، أدوات احترافية، عملاء حقيقيون — كل ده في مكان واحد.
          </p>
          <div className="mi__cta">
            <Link href="/merchant/apply" className="mi__btn mi__btn--primary">
              سجّل نشاطك الآن
            </Link>
            <a href={WA} target="_blank" rel="noreferrer" className="mi__btn mi__btn--ghost">
              كلّمنا واتساب
            </a>
          </div>
        </section>

        <section className="mi__section">
          <header className="mi__section-head">
            <span className="mi__section-icon"></span>
            <h2 className="mi__section-title">الباقة المجانية — للجميع</h2>
            <p className="mi__section-sub">كل المميزات دي من غير أي رسوم، إلى الأبد.</p>
          </header>
          <div className="mi__grid">
            {FREE_BENEFITS.map((b) => (
              <div key={b.title} className="mi__card">
                <h3 className="mi__card-title">{b.title}</h3>
                <p className="mi__card-body">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mi__section mi__section--premium">
          <header className="mi__section-head">
            <span className="mi__section-icon"></span>
            <h2 className="mi__section-title">الباقة المميزة — اختيارية</h2>
            <p className="mi__section-sub">لمّا تكون جاهز للتوسع. تجربة شهر مجانية كاملة.</p>
          </header>
          <div className="mi__grid">
            {PREMIUM_BENEFITS.map((b) => (
              <div key={b.title} className="mi__card mi__card--premium">
                <h3 className="mi__card-title">{b.title}</h3>
                <p className="mi__card-body">{b.body}</p>
              </div>
            ))}
          </div>
          <div className="mi__premium-cta">
            <a href={WA} target="_blank" rel="noreferrer" className="mi__btn mi__btn--premium">
              اعرف تفاصيل الباقات
            </a>
            <span className="mi__premium-note">
              نتكلم معاك ونوضح الأسعار اللي تناسبك
            </span>
          </div>
        </section>

        <section className="mi__section">
          <header className="mi__section-head">
            <span className="mi__section-icon"></span>
            <h2 className="mi__section-title">أسئلة شائعة</h2>
          </header>
          <div className="mi__faq">
            {FAQ.map((f) => (
              <details key={f.q} className="mi__faq-item">
                <summary className="mi__faq-q">{f.q}</summary>
                <p className="mi__faq-a">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mi__final-cta">
          <h2 className="mi__final-title">جاهز تبدأ؟</h2>
          <p className="mi__final-body">
            التسجيل بياخد دقيقة واحدة. فريقنا هيتواصل معاك لتأكيد النشاط.
          </p>
          <Link href="/merchant/apply" className="mi__btn mi__btn--primary mi__btn--lg">
            سجّل نشاطك مجاناً
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
