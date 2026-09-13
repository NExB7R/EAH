import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './advertise.css'

export const metadata = {
  title: 'أعلن معنا | EAH',
  description: 'خلّي مكانك يظهر الأول على EAH — مئات الزوار يوميًا من شبين القناطر',
}

const PACKAGES = [
  {
    id: 'starter',
    name: 'المميز',
    emoji: '⭐',
    price: 'مجانًا',
    period: 'لأول 3 شهور',
    tagline: 'خلّي مكانك يبان فوق',
    features: [
      'ظهور في "المميز" بالصفحة الرئيسية',
      'شارة "مميز" ذهبية على الكارد',
      'أولوية في نتائج البحث',
      'إحصائيات أساسية',
    ],
    cta: 'ابدأ مجانًا',
    accent: 'gold',
  },
  {
    id: 'pro',
    name: 'البرو',
    emoji: '🚀',
    price: 'يبدأ قريبًا',
    period: 'باقات شهرية',
    tagline: 'لكل مطعم عايز يكبر بجد',
    features: [
      'كل مميزات "المميز"',
      'ظهور في سلايدر "الرائج"',
      'بريدج في الصفحة الرئيسية',
      'إحصائيات مفصلة (مشاهدات، كشف رقم، واتساب)',
      'تحكم كامل في صفحتك',
    ],
    cta: 'تواصل معنا',
    accent: 'purple',
    featured: true,
  },
  {
    id: 'studio',
    name: 'الاستوديو',
    emoji: '🎨',
    price: 'يبدأ قريبًا',
    period: 'باقات متقدمة',
    tagline: 'لمن يريد الأفضل',
    features: [
      'كل مميزات "البرو"',
      'تصميم صفحة مخصص',
      'حملات إعلانية داخل المنصة',
      'CRM للعملاء (قريبًا)',
      'دعم أولوية',
    ],
    cta: 'تواصل معنا',
    accent: 'pink',
  },
]

export default function AdvertisePage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="adv">
        <section className="adv-hero">
          <div className="adv-hero__glow" aria-hidden />
          <span className="adv-hero__kicker">EAH ADVERTISE</span>
          <h1 className="adv-hero__title">
            خلّي مكانك <span className="adv-hero__accent">يظهر الأول</span>
          </h1>
          <p className="adv-hero__lead">
            مئات الزوار يوميًا من شبين القناطر بيدوروا على أكل، صيدلية، أو توصيل.
            خلي مكانك يظهرلهم في أول النتايج.
          </p>
        </section>

        <section className="adv-pricing">
          {PACKAGES.map((pkg) => (
            <article key={pkg.id} className={`adv-card adv-card--${pkg.accent} ${pkg.featured ? 'adv-card--featured' : ''}`}>
              {pkg.featured && <span className="adv-card__ribbon">الأكثر طلبًا</span>}
              <div className="adv-card__head">
                <span className="adv-card__emoji">{pkg.emoji}</span>
                <h2 className="adv-card__name">{pkg.name}</h2>
                <p className="adv-card__tagline">{pkg.tagline}</p>
              </div>
              <div className="adv-card__price">
                <span className="adv-card__price-value">{pkg.price}</span>
                <span className="adv-card__price-period">{pkg.period}</span>
              </div>
              <ul className="adv-card__features">
                {pkg.features.map((f, i) => (
                  <li key={i}><span className="adv-card__check">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/contact" className="adv-card__cta">{pkg.cta}</Link>
            </article>
          ))}
        </section>

        <section className="adv-cta">
          <div>
            <h2 className="adv-cta__title">عايز تتكلم معانا الأول؟</h2>
            <p className="adv-cta__text">فريقنا موجود يجاوبك على أي سؤال عن الباقات والمميزات.</p>
          </div>
          <Link href="/contact" className="adv-cta__btn">تواصل معنا ←</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
