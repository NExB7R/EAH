import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getActivePlans, formatDuration, formatPrice } from '@/lib/subscription'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './pricing.css'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'الباقات والأسعار',
  description: 'ارقى لباقة مميزة في EAH — شارة ذهبية، أولوية في البحث، إعلانات، ومعرض عروض. ابدأ بتجربة 30 يوم مجانية.',
}

const FEATURE_LABEL: Record<string, string> = {
  featured_badge: '⭐ شارة مميز ذهبية',
  priority_ranking: '🚀 أولوية في البحث والترندات',
  one_ad: '📢 إعلان واحد نشط',
  three_ads: '📢 3 إعلانات نشطة',
  unlimited_ads: '📢 إعلانات غير محدودة',
  offers_gallery: '🎁 معرض عروض احترافي',
  priority_support: '💎 دعم بأولوية',
}

const WHATSAPP = 'https://wa.me/201012892806'

export default async function PricingPage() {
  const plans = await getActivePlans()

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="pricing">
        <header className="pricing__hero">
          <span className="pricing__kicker">PREMIUM PLANS</span>
          <h1 className="pricing__title">الباقات والأسعار</h1>
          <p className="pricing__lead">
            ارقى بنشاطك لباقة مميزة، وخد شارة ذهبية، أولوية في البحث، وإعلانات ممولة.
            <br />
            <strong>ابدأ بتجربة 30 يوم مجانية — من غير أي التزام.</strong>
          </p>
        </header>

        {/* Trial highlight */}
        <section className="pricing__trial">
          <span className="pricing__trial-emoji">🎁</span>
          <div>
            <h2 className="pricing__trial-title">تجربة 30 يوم مجانية</h2>
            <p className="pricing__trial-body">
              كل نشاط جديد يقدر يطلب عضوية مميزة. لو الأدمن وافق، بيبدأ 30 يوم تجريبي
              بكل المميزات — من غير دفع. لو التجربة عجبتك، بتدفع وبتستمر. لو لأ، بترجع عضوية عادية.
            </p>
          </div>
        </section>

        {/* Plans */}
        {plans.length === 0 ? (
          <div className="pricing__empty">
            <p>لسه مفيش باقات متاحة. تواصل معنا للاستفسار.</p>
          </div>
        ) : (
          <section className="pricing__grid">
            {plans.map((p, i) => {
              const highlighted = i === Math.floor(plans.length / 2)
              return (
                <article
                  key={p.id}
                  className={`pricing__plan ${highlighted ? 'pricing__plan--featured' : ''}`}
                >
                  {highlighted && (
                    <span className="pricing__plan-ribbon">الأكثر اختيارًا</span>
                  )}
                  <div className="pricing__plan-head">
                    <h3 className="pricing__plan-name">{p.name_ar}</h3>
                    {p.description && (
                      <p className="pricing__plan-desc">{p.description}</p>
                    )}
                  </div>

                  <div className="pricing__plan-price">
                    {p.price_egp === null ? (
                      <span className="pricing__price-custom">تواصل معنا</span>
                    ) : (
                      <>
                        <span className="pricing__price-num">
                          {p.price_egp.toLocaleString('ar-EG')}
                        </span>
                        <span className="pricing__price-unit">ج.م</span>
                      </>
                    )}
                    <span className="pricing__plan-duration">
                      لمدة {formatDuration(p.duration_days)}
                    </span>
                  </div>

                  {p.trial_days > 0 && (
                    <div className="pricing__plan-trial">
                      🎁 + {p.trial_days} يوم تجربة مجانية
                    </div>
                  )}

                  <ul className="pricing__features">
                    {p.features?.map((f) => (
                      <li key={f} className="pricing__feature">
                        <span className="pricing__feature-check">✓</span>
                        <span>{FEATURE_LABEL[f] ?? f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noreferrer"
                    className={`pricing__btn ${highlighted ? 'pricing__btn--primary' : ''}`}
                  >
                    💬 اطلب الباقة
                  </a>
                </article>
              )
            })}
          </section>
        )}

        {/* Why premium */}
        <section className="pricing__why">
          <h2 className="pricing__why-title">ليه تشترك في مميز؟</h2>
          <div className="pricing__why-grid">
            <div className="pricing__why-card">
              <span className="pricing__why-emoji">⭐</span>
              <h3>تظهر الأول</h3>
              <p>الأنشطة المميزة بتظهر فوق في الرئيسية، صفحة الاكتشاف، والترندات.</p>
            </div>
            <div className="pricing__why-card">
              <span className="pricing__why-emoji">📢</span>
              <h3>إعلانات فعّالة</h3>
              <p>توصّل لعملاء أكتر عن طريق إعلانات داخل المنصة بدون أي تعقيد.</p>
            </div>
            <div className="pricing__why-card">
              <span className="pricing__why-emoji">🎁</span>
              <h3>معرض عروض</h3>
              <p>اعرض عروضك بشكل احترافي وواضح — جذاب للعميل ومُربح ليك.</p>
            </div>
            <div className="pricing__why-card">
              <span className="pricing__why-emoji">📊</span>
              <h3>تقارير وإحصائيات</h3>
              <p>اعرف كل حاجة عن نشاطك: مين زاره، ومين كلّمك، وأي عرض اشتغل أكتر.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pricing__faq">
          <h2 className="pricing__faq-title">أسئلة متكررة</h2>
          <div className="pricing__faq-list">
            <details className="pricing__faq-item">
              <summary>هل التجربة المجانية بتحتاج دفع؟</summary>
              <p>لأ. لو الأدمن وافق، بتاخد 30 يوم تجربة كامل بكل المميزات من غير أي دفع. الدفع بيبدأ بعد ما التجربة تخلص وانت توافق.</p>
            </details>
            <details className="pricing__faq-item">
              <summary>ينفع أوقف الاشتراك في أي وقت؟</summary>
              <p>أيوه. تواصل معانا على واتساب، وبنجمّد الاشتراك في نفس اليوم.</p>
            </details>
            <details className="pricing__faq-item">
              <summary>لو التجربة خلصت ومش عايز أكمل؟</summary>
              <p>مفيش أي مشكلة. عضوية نشاطك بترجع عادية، وكل بياناتك بتفضل محفوظة.</p>
            </details>
            <details className="pricing__faq-item">
              <summary>الأسعار ليه "تواصل معنا"؟</summary>
              <p>لأن كل نشاط له احتياجاته. كلّمنا وبنسعّرلك حسب حجم نشاطك واحتياجك. وثابت طول الاشتراك.</p>
            </details>
            <details className="pricing__faq-item">
              <summary>إيه اللي بيحصل لو مش دافعت؟</summary>
              <p>قبل ما الاشتراك يخلص بـ 7 أيام، هتوصلك تنبيهات يومية. لو الاشتراك خلص، المميزات بتوقف تلقائيًا وبترجع عضوية عادية.</p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="pricing__cta">
          <h2 className="pricing__cta-title">جاهز تبدأ؟</h2>
          <p className="pricing__cta-body">
            سجّل نشاطك الأول، وبعدها اطلب الباقة المميزة من لوحة التاجر.
          </p>
          <div className="pricing__cta-actions">
            <Link href="/merchant/apply" className="pricing__btn pricing__btn--primary">
              🏪 سجّل نشاطك
            </Link>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="pricing__btn"
            >
              💬 كلّمنا على واتساب
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
