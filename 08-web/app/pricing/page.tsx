import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './pricing.css'

export const metadata = {
  title: 'الباقات والأسعار',
  description:
    'باقات EAH لأصحاب الأنشطة — مجانية، مميزة، وبوت الأوردرات. بدون عمولة على الطلبات.',
}

const WA_NUM = '201012892806'
const WA = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(
  'مرحباً EAH، عايز أعرف تفاصيل الباقات لأصحاب الأنشطة'
)}`

type Plan = {
  key: string
  emoji: string
  name: string
  tagline: string
  price: string
  priceHint?: string
  highlight?: boolean
  cta: string
  ctaHref: string
  ctaStyle: 'primary' | 'ghost' | 'gold'
  features: { ok: boolean; text: string }[]
}

const PLANS: Plan[] = [
  {
    key: 'free',
    emoji: '🎁',
    name: 'المجانية',
    tagline: 'لأي نشاط يبدأ معانا',
    price: '0',
    priceHint: 'مجاناً للأبد',
    cta: 'ابدأ مجاناً',
    ctaHref: '/merchant/apply',
    ctaStyle: 'ghost',
    features: [
      { ok: true, text: 'ظهور كامل على المنصة' },
      { ok: true, text: 'صور ومنيو' },
      { ok: true, text: 'أرقام التواصل (واتساب/فون)' },
      { ok: true, text: 'تقييمات من العملاء' },
      { ok: true, text: 'رد على التقييمات' },
      { ok: true, text: 'QR Code للنشاط' },
      { ok: false, text: 'ظهور أول في البحث' },
      { ok: false, text: 'بوت الأوردرات' },
      { ok: false, text: 'إحصائيات متقدمة' },
    ],
  },
  {
    key: 'featured',
    emoji: '⭐',
    name: 'المميزة',
    tagline: 'لنشاط عايز يكبر',
    price: 'تواصل',
    priceHint: 'تجربة 30 يوم مجاناً',
    highlight: true,
    cta: '💬 كلّمنا واتساب',
    ctaHref: WA,
    ctaStyle: 'primary',
    features: [
      { ok: true, text: 'كل مميزات المجانية' },
      { ok: true, text: 'ظهور أول في البحث' },
      { ok: true, text: 'شارة ذهبية مميزة' },
      { ok: true, text: 'معرض عروض في الرئيسية' },
      { ok: true, text: 'إشعارات فورية' },
      { ok: true, text: 'إحصائيات متقدمة' },
      { ok: true, text: 'أولوية في الدعم' },
      { ok: false, text: 'بوت الأوردرات (منفصل)' },
    ],
  },
  {
    key: 'bot',
    emoji: '🤖',
    name: 'بوت الأوردرات',
    tagline: 'استقبل الأوردرات على واتساب',
    price: 'منفصل',
    priceHint: 'يُضاف لأي باقة',
    cta: '💬 كلّمنا واتساب',
    ctaHref: WA,
    ctaStyle: 'gold',
    features: [
      { ok: true, text: 'بوت يعرض الأوردرات' },
      { ok: true, text: 'العميل يكتب الأوردر' },
      { ok: true, text: 'إرسال تلقائي للواتساب' },
      { ok: true, text: 'إشعار فوري لك' },
      { ok: true, text: 'تتبع حالة الأوردر' },
      { ok: true, text: 'بدون عمولة على الطلبات' },
      { ok: true, text: 'يعمل على كل الأنشطة' },
    ],
  },
]

export default function PricingPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="pr">
        <section className="pr__hero">
          <div className="pr__hero-glow" aria-hidden />
          <span className="pr__kicker">PREMIUM PLANS</span>
          <h1 className="pr__title">الباقات والأسعار</h1>
          <p className="pr__lead">
            اختار اللي يناسب نشاطك. بدون عمولة على الطلبات —{' '}
            <strong>كل جنيه لنشاطك</strong>.
          </p>
        </section>

        <section className="pr__trial">
          <span className="pr__trial-emoji">🎁</span>
          <div>
            <strong className="pr__trial-title">
              تجربة مجانية 30 يوم على الباقة المميزة
            </strong>
            <p className="pr__trial-text">
              سجّل نشاطك واستفيد من كل المميزات لمدة شهر كامل — بدون التزام،
              بدون دفع مقدم.
            </p>
          </div>
        </section>

        <section className="pr__plans">
          {PLANS.map((p) => (
            <article
              key={p.key}
              className={`pr__plan ${p.highlight ? 'pr__plan--highlight' : ''}`}
            >
              {p.highlight && (
                <span className="pr__plan-badge">الأكثر طلباً</span>
              )}
              <span className="pr__plan-emoji">{p.emoji}</span>
              <h3 className="pr__plan-name">{p.name}</h3>
              <p className="pr__plan-tagline">{p.tagline}</p>

              <div className="pr__price">
                <span className="pr__price-value">{p.price}</span>
                {p.priceHint && (
                  <span className="pr__price-hint">{p.priceHint}</span>
                )}
              </div>

              <ul className="pr__features">
                {p.features.map((f, i) => (
                  <li
                    key={i}
                    className={`pr__feature ${f.ok ? '' : 'pr__feature--off'}`}
                  >
                    <span className="pr__feature-icon">
                      {f.ok ? '✓' : '—'}
                    </span>
                    <span className="pr__feature-text">{f.text}</span>
                  </li>
                ))}
              </ul>

              <a
                href={p.ctaHref}
                target={p.ctaHref.startsWith('http') ? '_blank' : undefined}
                rel={p.ctaHref.startsWith('http') ? 'noreferrer' : undefined}
                className={`pr__cta pr__cta--${p.ctaStyle}`}
              >
                {p.cta}
              </a>
            </article>
          ))}
        </section>

        <section className="pr__compare">
          <h2 className="pr__compare-title">ليه EAH مختلفة؟</h2>
          <div className="pr__compare-grid">
            <div className="pr__compare-item">
              <span className="pr__compare-icon">💰</span>
              <strong>بدون عمولة</strong>
              <p>التطبيقات التانية بتاخد 15-25%. EAH بتسيبك بكل الأرباح.</p>
            </div>
            <div className="pr__compare-item">
              <span className="pr__compare-icon">🎁</span>
              <strong>مجاني للعميل</strong>
              <p>العميل مش بيدفع حاجة — إنت بس بتستفيد.</p>
            </div>
            <div className="pr__compare-item">
              <span className="pr__compare-icon">📍</span>
              <strong>محلي بجد</strong>
              <p>شبين القناطر + القرى حواليها. مش القاهرة وخلاص.</p>
            </div>
            <div className="pr__compare-item">
              <span className="pr__compare-icon">🤖</span>
              <strong>بوت الأوردرات</strong>
              <p>ميزة مفيش منافس بيقدمها في مصر بنفس السعر.</p>
            </div>
          </div>
        </section>

        <section className="pr__faq">
          <h2 className="pr__faq-title">أسئلة شائعة</h2>
          {[
            {
              q: 'هل في عمولة على الطلبات؟',
              a: 'لا، أبداً. الطلبات توصل لك مباشرة على واتساب. إنت بتحتفظ بكل الأرباح.',
            },
            {
              q: 'التجربة المجانية — هل محتاج بطاقة؟',
              a: 'لا. التجربة مجانية بالكامل. لو مش عايز تكمل بعد التجربة، خلاص.',
            },
            {
              q: 'ينفع ألغى في أي وقت؟',
              a: 'أيوة. مفيش أي عقود. كل الاشتراكات شهرية وتقدر تلغي في أي لحظة.',
            },
            {
              q: 'هل بوت الأوردرات منفصل عن الباقات؟',
              a: 'أيوة، هو إضافة مستقلة تقدر تضيفها لأي باقة. كلّمنا واتساب للتفاصيل.',
            },
          ].map((f) => (
            <details key={f.q} className="pr__faq-item">
              <summary className="pr__faq-q">{f.q}</summary>
              <p className="pr__faq-a">{f.a}</p>
            </details>
          ))}
        </section>

        <section className="pr__final">
          <h2 className="pr__final-title">مش محتاج تدفع دلوقتي</h2>
          <p className="pr__final-text">
            ابدأ بالباقة المجانية، وإحنا هنتواصل معاك لما تكون جاهز تتوسع.
          </p>
          <div className="pr__final-actions">
            <Link href="/merchant/apply" className="pr__btn pr__btn--primary">
              🚀 سجّل نشاطك
            </Link>
            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className="pr__btn pr__btn--ghost"
            >
              💬 كلّمنا واتساب
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
