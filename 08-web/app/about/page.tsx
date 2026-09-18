import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import TrustSection from '@/components/trust-section'
import ComingSoon from '@/components/coming-soon'
import './about.css'
import {
  IcUser, IcStore, IcHeart, IcFlag, IcCompass, IcSparkle,
  IcRestaurant, IcPharmacy, IcMarket, IcDelivery, IcOffer, IcStar, IcFire, IcNew,
  IcTarget, IcChat, IcBolt, IcHand, IcRocket, IcShield,
} from '@/components/eah-icons'

export const metadata = {
  title: 'احنا مين',
  description: 'EAH — قصة، قيم، وحكاية منصة اكتشاف محلية.',
}

const PILLARS = [
  { num: '0%',  label: 'عمولة على أي طلب',  color: '#E8C79A' },
  { num: '30',  label: 'يوم تجربة مجانية',   color: '#A855F7' },
  { num: '100%', label: 'مجاني للعميل',      color: '#FBBF24' },
]

const FOR_WHO = [
  {
    icon: <IcUser />,
    title: 'للعميل',
    desc: 'اكتشف الأماكن اللي حواليك على مزاجك — بدون تسجيل معقّد، بدون رسوم، بدون أي تعقيد.',
    cta: { label: 'اكتشف الأماكن', href: '/explore' },
    accent: '#A855F7',
  },
  {
    icon: <IcStore />,
    title: 'للشريك',
    desc: 'سجّل نشاطك مجاناً، وابدأ تجربة 30 يوم بكل المميزات. بدون عمولة على أي أوردر.',
    cta: { label: 'سجّل نشاطك', href: '/merchant-info' },
    accent: '#E8C79A',
  },
  {
    icon: <IcHeart />,
    title: 'للقضية',
    desc: 'كل إعلان على EAH بيدعم فلسطين — بدون أي زيادة على المعلن. القضية في القلب.',
    cta: { label: 'فلسطين في القلب', href: '/support-palestine' },
    accent: '#EC4899',
  },
]

const WHAT_WE_DO = [
  { icon: <IcRestaurant />, label: 'مطاعم' },
  { icon: <IcPharmacy />,   label: 'صيدليات' },
  { icon: <IcMarket />,     label: 'ماركت' },
  { icon: <IcDelivery />,   label: 'توصيل' },
  { icon: <IcOffer />,      label: 'عروض' },
  { icon: <IcStar />,       label: 'مميزين' },
  { icon: <IcFire />,       label: 'الترند' },
  { icon: <IcNew />,        label: 'الجديد' },
]

const VALUES = [
  { icon: <IcTarget />, title: 'بنوصّلك الصح',     body: 'ترشيحات على مزاجك وميزانيتك — مش الأكثر دفعاً.' },
  { icon: <IcChat />,   title: 'بنسمعك دايمًا',    body: 'كل اقتراح وكل شكوى بتوصلنا، وبنبني عليها.' },
  { icon: <IcBolt />,   title: 'تجربة خفيفة',      body: 'من غير تعقيد — بتلاقي وبتتواصل في ثواني.' },
  { icon: <IcHand />,   title: 'دعم البيوت',      body: 'بنخلي المشروع الصغير يوصل لناس أكتر.' },
]

const ORDER_STEPS = [
  { num: '1', color: '37,211,102', title: 'اختار المكان',       desc: 'من الرئيسية أو البحث — أي نشاط بيقبل أوردرات هيبان لك زر واضح.' },
  { num: '2', color: '168,85,247', title: 'اكتب طلبك',         desc: 'اسمك، عنوانك، والأوردر — بيتبعت جاهز ومهيأ مع كود خاص.' },
  { num: '3', color: '232,199,154', title: 'يوصل على واتساب',  desc: 'الرسالة فيها كل حاجة — اسمك، رقمك، عنوانك، والأوردر بكود مرجعي.' },
  { num: '4', color: '16,185,129', title: 'تأكيد فوري',        desc: 'لما المكان يستلم أوردرك، بيوصلك إشعار مباشر إنه اتأكد.' },
]

export default function AboutPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="ab">
        {/* ═══ HERO ═══ */}
        <section className="ab__hero">
          <div className="ab__hero-glow" aria-hidden />
          <span className="ab__kicker e-badge e-badge--accent">احنا مين</span>
          <h1 className="ab__title e-gradient">
            كل حاجة محتاجها،
            <br />
            <span className="ab__title-accent">في مكان واحد</span>
          </h1>
          <p className="ab__lead">
            EAH منصة اكتشاف محلية — بدأت من شبين القناطر، بتكبر مع كل قرية جديدة.<br/>
            كل حاجة حواليك — على بعد كليك.
          </p>
          <div className="ab__hero-cta">
            <Link href="/explore" className="ab__btn ab__btn--primary">اكتشف الأماكن</Link>
            <Link href="/merchant-info" className="ab__btn ab__btn--ghost">لأصحاب الأنشطة</Link>
          </div>
        </section>

        {/* ═══ PILLARS ═══ */}
        <section className="ab__hooks">
          {PILLARS.map((h) => (
            <div key={h.label} className="ab__hook">
              <span className="ab__hook-num" style={{ color: h.color }}>{h.num}</span>
              <span className="ab__hook-label">{h.label}</span>
            </div>
          ))}
        </section>

        {/* ═══ STORY ═══ */}
        <section className="ab__section">
          <header className="ab__section-head">
            <span className="ab__section-kicker">الحكاية</span>
            <h2 className="ab__section-title">سؤال بسيط.. حكاية كبيرة</h2>
          </header>
          <div className="ab__story">
            <p>"إيه أقرب حاجة ليّا دلوقتي؟"</p>
            <p>مفيش إجابة كانت سهلة. الناس كانت بتسأل في جروبات، تدور على أرقام، تسأل صحابها.</p>
            <p>EAH جت تجاوب — بسرعة. وبدون لف.</p>
          </div>
        </section>

        {/* ═══ FOR WHO ═══ */}
        <section className="ab__section">
          <header className="ab__section-head">
            <span className="ab__section-kicker">احنا لمين</span>
            <h2 className="ab__section-title">لواحد من التلاتة</h2>
          </header>
          <div className="ab__forwho">
            {FOR_WHO.map((w) => (
              <article key={w.title} className="ab__forwho-card" style={{ '--accent': w.accent } as React.CSSProperties}>
                <span className="ab__forwho-icon">{w.icon}</span>
                <h3 className="ab__forwho-title">{w.title}</h3>
                <p className="ab__forwho-desc">{w.desc}</p>
                <Link href={w.cta.href} className="ab__forwho-cta">{w.cta.label} ←</Link>
              </article>
            ))}
          </div>
        </section>

        {/* ═══ WHAT WE DO ═══ */}
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

        {/* ═══ VALUES ═══ */}
        <section className="ab__section">
          <header className="ab__section-head">
            <span className="ab__section-kicker">قيمنا</span>
            <h2 className="ab__section-title">4 مبادئ بنمشي عليها</h2>
          </header>
          <div className="ab__values">
            {VALUES.map((v) => (
              <article key={v.title} className="ab__value">
                <span className="ab__value-icon">{v.icon}</span>
                <h3 className="ab__value-title">{v.title}</h3>
                <p className="ab__value-body">{v.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ═══ ORDER FLOW ═══ */}
        <section className="ab__section">
          <header className="ab__section-head">
            <span className="ab__section-kicker">الأوردرات</span>
            <h2 className="ab__section-title">اطلب من أي نشاط — على واتساب</h2>
          </header>
          <div className="ab__flow">
            {ORDER_STEPS.map((s) => (
              <div
                key={s.num}
                className="ab__flow-step"
                style={{ '--step': s.color } as React.CSSProperties}
              >
                <span className="ab__flow-num">{s.num}</span>
                <strong className="ab__flow-title">{s.title}</strong>
                <p className="ab__flow-desc">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="ab__flow-note">
            للمطاعم: استقبال أوردرات واتساب متاح مجانًا خلال تجربة الـ30 يوم
          </p>
        </section>

        <TrustSection />
        <ComingSoon />

        {/* ═══ CTA ═══ */}
        <section className="ab__cta">
          <span className="ab__cta-icon"><IcRocket /></span>
          <h2 className="ab__cta-title">جاهز تبدأ معانا؟</h2>
          <p className="ab__cta-body">
            بتدور على مكان؟ عندك نشاط وعايز توصل لناس أكتر؟<br/>
            EAH هي المكان الصح.
          </p>
          <div className="ab__cta-actions">
            <Link href="/contact" className="ab__btn ab__btn--primary">تواصل معانا</Link>
            <Link href="/merchant/apply" className="ab__btn ab__btn--ghost">سجّل نشاطك</Link>
          </div>
          <p className="ab__cta-note">
            <IcFlag /> فلسطين في القلب — جزء من كل دخل بيروح للقضية.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
