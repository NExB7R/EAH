import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import TrustSection from '@/components/trust-section'
import ComingSoon from '@/components/coming-soon'
import './about.css'

export const metadata = {
  title: 'من إحنا',
  description: 'EAH — كل حاجة حواليك في مكان واحد.',
}

const HOOKS = [
  { num: '0%', label: 'عمولة على أي طلب', color: '#E8C79A' },
  { num: '30 يوم', label: 'تجربة مجانية للشريك', color: '#A855F7' },
  { num: '100%', label: 'مجاني للعميل — للأبد', color: '#FBBF24' },
]

const FOR_WHO = [
  {
    emoji: '',
    title: 'للعميل',
    desc: 'اكتشف الأماكن اللي حواليك على مزاجك — بدون تسجيل معقّد، بدون رسوم.',
    cta: { label: 'يلا اكتشف', href: '/explore' },
  },
  {
    emoji: '',
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
  { icon: '', label: 'مطاعم' },
  { icon: '', label: 'صيدليات' },
  { icon: '', label: 'ماركت' },
  { icon: '', label: 'توصيل' },
  { icon: '', label: 'عروض' },
  { icon: '', label: 'مميزين' },
  { icon: '', label: 'الترند' },
  { icon: '', label: 'الجديد' },
]

const VALUES = [
  { emoji: '', title: 'بنوصّلك الصح', body: 'ترشيحات على مزاجك وميزانيتك — مش الأكثر دفعاً.' },
  { emoji: '💜', title: 'بنسمعك دايمًا', body: 'كل اقتراح وكل شكوى بتوصلنا، وبنبني عليها.' },
  { emoji: '', title: 'تجربة خفيفة', body: 'من غير تعقيد — بتلاقي وبتتواصل في ثواني.' },
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
            كل حاجة محتاجها،
            <br />
            <span className="ab__title-accent">في مكان واحد</span>
          </h1>
          <p className="ab__lead">كل حاجة حواليك — على بعد كليك.</p>
          <div className="ab__hero-cta">
            <Link href="/explore" className="ab__btn ab__btn--primary">اكتشف الأماكن</Link>
            <Link href="/merchant-info" className="ab__btn ab__btn--ghost">لأصحاب الأنشطة</Link>
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
            <h2 className="ab__section-title">سؤال بسيط.. حكاية كبيرة</h2>
          </header>
          <div className="ab__story">
            <p>إيه أقرب حاجة ليّا دلوقتي؟</p>
            <p>مفيش إجابة كانت سهلة.</p>
            <p>EAH جت تجاوب — بسرعة. وبدون لف.</p>
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

        <section className="ab__section">
          <header className="ab__section-head">
            <span className="ab__section-kicker">الأوردرات</span>
            <h2 className="ab__section-title">اطلب من أي نشاط — على واتساب</h2>
          </header>
          <div className="ab__order-flow" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 18 }}>
            <div className="ab__flow-step" style={{ padding: 20, borderRadius: 16, background: 'rgba(37,211,102,.05)', border: '1px solid rgba(37,211,102,.25)' }}>
              <span style={{ display: 'block', fontSize: '1.6rem', marginBottom: 8 }}>1️⃣</span>
              <strong style={{ display: 'block', fontFamily: 'var(--font-cairo-play, var(--font-cairo, system-ui))', color: '#F4F2FA', marginBottom: 4 }}>اختار المكان</strong>
              <p style={{ fontFamily: 'var(--font-cairo, system-ui)', fontSize: '.82rem', color: '#A29DB5', lineHeight: 1.6, margin: 0 }}>من الرئيسية أو البحث — أي نشاط بيقبل أوردرات هيبان لك زر واضح.</p>
            </div>
            <div className="ab__flow-step" style={{ padding: 20, borderRadius: 16, background: 'rgba(168,85,247,.05)', border: '1px solid rgba(168,85,247,.25)' }}>
              <span style={{ display: 'block', fontSize: '1.6rem', marginBottom: 8 }}>2️⃣</span>
              <strong style={{ display: 'block', fontFamily: 'var(--font-cairo-play, var(--font-cairo, system-ui))', color: '#F4F2FA', marginBottom: 4 }}>اكتب طلبك</strong>
              <p style={{ fontFamily: 'var(--font-cairo, system-ui)', fontSize: '.82rem', color: '#A29DB5', lineHeight: 1.6, margin: 0 }}>اسمك، عنوانك، والأوردر — بيتبعت جاهز ومهيأ مع كود خاص.</p>
            </div>
            <div className="ab__flow-step" style={{ padding: 20, borderRadius: 16, background: 'rgba(232,199,154,.05)', border: '1px solid rgba(232,199,154,.3)' }}>
              <span style={{ display: 'block', fontSize: '1.6rem', marginBottom: 8 }}>3️⃣</span>
              <strong style={{ display: 'block', fontFamily: 'var(--font-cairo-play, var(--font-cairo, system-ui))', color: '#F4F2FA', marginBottom: 4 }}>يوصل على واتساب المكان</strong>
              <p style={{ fontFamily: 'var(--font-cairo, system-ui)', fontSize: '.82rem', color: '#A29DB5', lineHeight: 1.6, margin: 0 }}>الرسالة فيها كل حاجة — اسمك، رقمك، عنوانك، والأوردر بكود مرجعي.</p>
            </div>
            <div className="ab__flow-step" style={{ padding: 20, borderRadius: 16, background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.3)' }}>
              <span style={{ display: 'block', fontSize: '1.6rem', marginBottom: 8 }}>4️⃣</span>
              <strong style={{ display: 'block', fontFamily: 'var(--font-cairo-play, var(--font-cairo, system-ui))', color: '#F4F2FA', marginBottom: 4 }}>تأكيد فوري</strong>
              <p style={{ fontFamily: 'var(--font-cairo, system-ui)', fontSize: '.82rem', color: '#A29DB5', lineHeight: 1.6, margin: 0 }}>لما المكان يستلم أوردرك، بيوصلك إشعار مباشر إنه اتأكد — مش هتفضل مستني.</p>
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-cairo, system-ui)', fontSize: '.85rem', color: '#E8C79A', textAlign: 'center', marginTop: 20, fontWeight: 700 }}>
            للمطاعم: استقبال أوردرات واتساب متاح مجانًا خلال تجربة الـ30 يوم
          </p>
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
            <Link href="/contact" className="ab__btn ab__btn--primary">تواصل معانا</Link>
            <Link href="/merchant/apply" className="ab__btn ab__btn--ghost">سجّل نشاطك</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
