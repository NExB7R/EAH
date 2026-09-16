import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import TrustSection from '@/components/trust-section'
import ComingSoon from '@/components/coming-soon'
import './about.css'

export const metadata = {
  title: 'من إحنا',
  description: 'EAH — حكاية منصة اكتشاف محلية بتحب المكان اللي فيه.',
}

const HOOKS = [
  { num: '0%', label: 'عمولة على أي طلب', color: '#E8C79A' },
  { num: '30 يوم', label: 'تجربة مجانية للشريك', color: '#A855F7' },
  { num: '100%', label: 'مجاني للعميل — للأبد', color: '#FBBF24' },
]

const FOR_WHO = [
  {
    emoji: '🛍️',
    title: 'للعميل',
    desc: 'اكتشف الأماكن اللي حواليك على مزاجك — بدون تسجيل معقّد، بدون رسوم.',
    cta: { label: 'يلا اكتشف', href: '/explore' },
  },
  {
    emoji: '🏪',
    title: 'للشريك',
    desc: 'سجّل نشاطك مجاناً، وابدأ تجربة 30 يوم من كل الميزات المدفوعة.',
    cta: { label: 'سجّل نشاطك', href: '/merchant-info' },
  },
  {
    emoji: '🇵🇸',
    title: 'للدعم',
    desc: 'كل إعلان على EAH بيدعم القضية. إحنا أخوات — والقضية في القلب.',
    cta: { label: 'فلسطين في القلب', href: '/support-palestine' },
  },
]

const WHAT_WE_DO = [
  { icon: '🍽️', label: 'مطاعم' },
  { icon: '💊', label: 'صيدليات' },
  { icon: '🛒', label: 'ماركت' },
  { icon: '🛵', label: 'توصيل' },
  { icon: '🎁', label: 'عروض' },
  { icon: '👑', label: 'مميزين' },
  { icon: '🔥', label: 'الترند' },
  { icon: '🆕', label: 'الجديد' },
]

const VALUES = [
  { emoji: '🎯', title: 'بنوصّلك الصح', body: 'ترشيحات على مزاجك وميزانيتك — مش الأكثر دفعاً.' },
  { emoji: '💜', title: 'بنسمعك دايمًا', body: 'كل اقتراح وكل شكوى بتوصلنا، وبنبني عليها.' },
  { emoji: '⚡', title: 'تجربة خفيفة', body: 'من غير تعقيد — بتلاقي وبتتواصل في ثواني.' },
  { emoji: '🤝', title: 'دعم البيوت المحلية', body: 'بنخلي المشروع الصغير يوصل لناس أكتر.' },
]

export default function AboutPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="ab">
        {/* Hero */}
        <section className="ab__hero">
          <div className="ab__hero-glow" aria-hidden />
          <span className="ab__kicker">من إحنا</span>
          <h1 className="ab__title">
            منصة اكتشاف محلية،
            <br />
            <span className="ab__title-accent">بتحب المكان اللي فيه</span>
          </h1>
          <p className="ab__lead">
            من مطعم السكة.. للصيدلية اللي جوه الحارة..<br/>
            EAH بتجمع كل حاجة حواليك في مكان واحد.
          </p>
          <div className="ab__hero-cta">
            <Link href="/explore" className="ab__btn ab__btn--primary">🔍 اكتشف الأماكن</Link>
            <Link href="/merchant-info" className="ab__btn ab__btn--ghost">🏪 لأصحاب الأنشطة</Link>
          </div>
        </section>

        {/* Hooks — لا أرقام عبيطة */}
        <section className="ab__hooks">
          {HOOKS.map((h) => (
            <div key={h.label} className="ab__hook">
              <span className="ab__hook-num" style={{ color: h.color }}>{h.num}</span>
              <span className="ab__hook-label">{h.label}</span>
            </div>
          ))}
        </section>

        {/* Story — قصيرة، هوك مش جرنان */}
        <section className="ab__section">
          <header className="ab__section-head">
            <span className="ab__section-kicker">الحكاية</span>
            <h2 className="ab__section-title">بدأنا من سؤال بسيط</h2>
          </header>
          <div className="ab__story">
            <p>إيه أفضل حاجة قريبة مني دلوقتي؟</p>
            <p>مفيش إجابة سهلة كانت — ولحد دلوقتي.</p>
            <p>EAH بتجاوب على السؤال ده — بسرعة، وبدون لف ودوران.</p>
          </div>
        </section>

        {/* لمين */}
        <section className="ab__section">
          <header className="ab__section-head">
            <span className="ab__section-kicker">إحنا لمين</span>
            <h2 className="ab__section-title">لواحد من التلاتة</h2>
          </header>
          <div className="ab__forwho">
            {FOR_WHO.map((w) => (
              <article key={w.title} className="ab__forwho-card">
                <span className="ab__forwho-emoji">{w.emoji}</span>
                <h3 className="ab__forwho-title">{w.title}</h3>
                <p className="ab__forwho-desc">{w.desc}</p>
                <Link href={w.cta.href} className="ab__forwho-cta">{w.cta.label} ←</Link>
              </article>
            ))}
          </div>
        </section>

        {/* بنعمل إيه */}
        <section className="ab__section">
          <header className="ab__section-head">
            <span className="ab__section-kicker">بنعمل إيه</span>
            <h2 className="ab__section-title">8 حاجات تلاقيها عندنا</h2>
          </header>
          <div className="ab__grid">
            {WHAT_WE_DO.map((it) => (
              <div key={it.label} className="ab__grid-item">
                <span className="ab__grid-icon">{it.icon}</span>
                <span className="ab__grid-label">{it.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* قيمنا */}
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

        <TrustSection />
        <ComingSoon />

        {/* CTA */}
        <section className="ab__cta">
          <h2 className="ab__cta-title">جاهز تبدأ معانا؟</h2>
          <p className="ab__cta-body">
            بتدور على مكان؟ عندك نشاط وعايز توصل لناس أكتر؟<br/>
            EAH هي المكان الصح.
          </p>
          <div className="ab__cta-actions">
            <Link href="/contact" className="ab__btn ab__btn--primary">💬 تواصل معانا</Link>
            <Link href="/merchant/apply" className="ab__btn ab__btn--ghost">🏪 سجّل نشاطك</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
