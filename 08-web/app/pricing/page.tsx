import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './pricing.css'

export const metadata = {
  title: 'الباقات',
  description: 'باقات EAH — مجاني للأبد، وتجربة 30 يوم على المميز.',
}

const PLANS = [
  {
    key: 'free',
    emoji: '🎁',
    name: 'المجانية',
    badge: 'مدى الحياة',
    tagline: 'للشركاء الجديدين',
    price: '0',
    unit: 'جنيه — للأبد',
    cta: { label: 'سجّل نشاطك', href: '/merchant/apply' },
    accent: 'free',
    features: [
      '✅ صفحة كاملة لنشاطك',
      '✅ تظهر في البحث والاستكشاف',
      '✅ اسم + عنوان + ساعات العمل',
      '✅ رقم واحد للتواصل',
      '✅ صورة رئيسية',
      '✅ تحديث البيانات من لوحة التحكم',
    ],
  },
  {
    key: 'premium',
    emoji: '👑',
    name: 'المميزة',
    badge: '30 يوم تجربة',
    tagline: 'تجربة كاملة قبل ما تدفع',
    price: 'تواصل',
    unit: 'معانا لسعر يناسبك',
    cta: { label: 'ابدأ التجربة', href: '/merchant/apply' },
    accent: 'premium',
    highlight: true,
    features: [
      '🎁 تجربة 30 يوم بكل الميزات — تلقائي',
      '✅ كل مميزات المجانية +',
      '👑 شارة "مميز" على صفحتك',
      '🚀 أولوية في الترتيب والبحث',
      '📷 معرض صور كامل',
      '🔥 عروض غير محدودة',
      '📊 تحليلات مفصلة (مشاهدات، ضغطات)',
      '🔔 إشعارات فورية للعملاء',
      '📱 QR كود للطباعة على الفاتورة',
      '💬 أولوية دعم مباشر',
    ],
  },
  {
    key: 'bot',
    emoji: '🤖',
    name: 'بوت الأوردرات',
    badge: 'Add-on',
    tagline: 'يشتغل لوحده',
    price: 'تواصل',
    unit: 'معانا للسعر',
    cta: { label: 'اسأل عن البوت', href: 'https://wa.me/201012892806?text=عايز أعرف أكتر عن بوت الأوردرات' },
    accent: 'bot',
    features: [
      '🤖 بوت ذكي يستقبل الأوردرات',
      '📲 يبعت لك على واتساب فورًا',
      '📋 نموذج أوردر جاهز للعميل',
      '⏱️ إدارة حالة الأوردر (جديد/مقبول/تم)',
      '📈 إحصائيات الأوردرات',
      '🔒 أمان كامل + منع التلاعب',
    ],
  },
]

const FAQ = [
  {
    q: 'إيه الفرق بين الباقة والإعلان؟',
    a: 'الباقة = نشاطك كامل على EAH. الإعلان = مساحة إعلانية منفصلة تمامًا. تقدر تعلن من غير باقة، وتقدر تشترك من غير إعلانات.',
  },
  {
    q: 'التجربة 30 يوم بتشتغل إزاي؟',
    a: 'أول ما تسجّل نشاطك وتوافق على البيانات، التجربة تبدأ تلقائيًا — بكل الميزات المدفوعة. مفيش دفعة مقدمة، ومفيش أي تعهد.',
  },
  {
    q: 'لو ما كملتش بعد التجربة؟',
    a: 'نشاطك يرجع للباقة المجانية تلقائيًا — من غير أي حذف لبياناتك. تقدر تكمل لما تحب.',
  },
  {
    q: 'الأسعار ليه "تواصل معانا"؟',
    a: 'لأن كل نشاط مختلف. بنسألك عن حجمك، احتياجاتك، وميزانيتك — وبنظبطلك سعر يناسبك. مفيش أسعار ثابتة عبيطة.',
  },
  {
    q: 'في أي التزام أو رسوم خفية؟',
    a: 'لأ. تدفع بس لما تقرر. تقدر تلغي في أي وقت. و5% من أي إعلان بيروح لدعم فلسطين — بدون أي زيادة عليك.',
  },
]

export default function PricingPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="pr">
        <section className="pr-hero">
          <div className="pr-hero__glow" aria-hidden />
          <span className="pr__kicker">الباقات</span>
          <h1 className="pr__title">
            ابدأ مجانًا.
            <br />
            <span className="pr__title-accent">واكتشف الباقي بنفسك</span>
          </h1>
          <p className="pr__lead">
            مجاني للأبد على الباقة الأساسية.<br/>
            وتجربة 30 يوم كاملة على المميزة — <strong>تلقائي، من غير أي دفعة</strong>.
          </p>
        </section>

        <section className="pr-plans">
          {PLANS.map((plan) => (
            <article key={plan.key} className={`pr-plan pr-plan--${plan.accent} ${plan.highlight ? 'is-highlight' : ''}`}>
              {plan.badge && <span className="pr-plan__badge">{plan.badge}</span>}
              <span className="pr-plan__emoji">{plan.emoji}</span>
              <h3 className="pr-plan__name">{plan.name}</h3>
              <p className="pr-plan__tagline">{plan.tagline}</p>
              <div className="pr-plan__price">
                <span className="pr-plan__price-num">{plan.price}</span>
                <span className="pr-plan__price-unit">{plan.unit}</span>
              </div>
              <ul className="pr-plan__features">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link href={plan.cta.href} className="pr-plan__cta">
                {plan.cta.label} ←
              </Link>
            </article>
          ))}
        </section>

        <section className="pr-compare">
          <h2 className="pr-compare__title">الباقة vs الإعلانات</h2>
          <div className="pr-compare__grid">
            <div className="pr-compare__card">
              <span className="pr-compare__emoji">📦</span>
              <strong>الباقة</strong>
              <p>نشاطك كامل — صفحة، منيو، عروض، أوردرات، إحصائيات.</p>
              <Link href="/merchant/apply" className="pr-compare__link">سجّل نشاطك ←</Link>
            </div>
            <div className="pr-compare__card">
              <span className="pr-compare__emoji">📢</span>
              <strong>الإعلانات</strong>
              <p>مساحة إعلانية منفصلة — أي حد يقدر يعلن، حتى من غير باقة.</p>
              <Link href="/advertise" className="pr-compare__link">شوف الإعلانات ←</Link>
            </div>
          </div>
        </section>

        <section className="pr-faq">
          <h2 className="pr-faq__title">أسئلة بتتكرر</h2>
          <div className="pr-faq__list">
            {FAQ.map((f) => (
              <details key={f.q} className="pr-faq__item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="pr-cta">
          <h2 className="pr-cta__title">جاهز تبدأ؟</h2>
          <p className="pr-cta__body">
            سجّل نشاطك مجانًا. تجربتك تبدأ تلقائي — وكل حاجة واضحة من غير كلام كتير.
          </p>
          <div className="pr-cta__actions">
            <Link href="/merchant/apply" className="pr-cta__btn pr-cta__btn--primary">🚀 سجّل نشاطك</Link>
            <a href="https://wa.me/201012892806?text=عايز أعرف الأسعار" target="_blank" rel="noreferrer" className="pr-cta__btn pr-cta__btn--ghost">💬 كلمنا</a>
          </div>
          <p className="pr-cta__note">🇵🇸 جزء من كل دخل بيروح لدعم أهلنا في فلسطين.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
