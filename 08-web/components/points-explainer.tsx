import Link from 'next/link'
import './points-explainer.css'

export default function PointsExplainer() {
  return (
    <section className="pe">
      <header className="pe__head">
        <span className="pe__kicker">REWARDS</span>
        <h2 className="pe__title">💰 إزاي تستفيد من <span className="pe__accent">نقاطك</span>؟</h2>
        <p className="pe__lead">
          كل يوم تدخل EAH = نقاط. كل تفاعل = نقاط. والنقاط بتتحوّل مكافآت حقيقية.
        </p>
      </header>

      <div className="pe__earn">
        <h3 className="pe__subtitle">🎯 طرق كسب النقاط</h3>
        <div className="pe__grid">
          <div className="pe__item"><span className="pe__emoji">📅</span><strong>+5</strong><span>زيارة يومية</span></div>
          <div className="pe__item"><span className="pe__emoji">🔥</span><strong>+7</strong><span>3 أيام متتالية</span></div>
          <div className="pe__item"><span className="pe__emoji">🔥🔥</span><strong>+10</strong><span>7 أيام متتالية</span></div>
          <div className="pe__item"><span className="pe__emoji">💎</span><strong>+20</strong><span>30 يوم متتالي</span></div>
          <div className="pe__item"><span className="pe__emoji">🎁</span><strong>+50</strong><span>دعوة صاحب جديد</span></div>
        </div>
      </div>

      <div className="pe__spend">
        <h3 className="pe__subtitle">🎁 ماذا تستبدل بها؟</h3>
        <div className="pe__spend-grid">
          <div className="pe__spend-card">
            <span className="pe__spend-emoji">🛵</span>
            <strong>توصيل مجاني</strong>
            <span>من 100 نقطة</span>
          </div>
          <div className="pe__spend-card">
            <span className="pe__spend-emoji">🎟️</span>
            <strong>قسائم خصم</strong>
            <span>من 250 نقطة</span>
          </div>
          <div className="pe__spend-card">
            <span className="pe__spend-emoji">🍽️</span>
            <strong>وجبة مجانية</strong>
            <span>من 800 نقطة</span>
          </div>
          <div className="pe__spend-card">
            <span className="pe__spend-emoji">👑</span>
            <strong>إطار ذهبي</strong>
            <span>من 1000 نقطة</span>
          </div>
          <div className="pe__spend-card">
            <span className="pe__spend-emoji">🏆</span>
            <strong>شارات حصرية</strong>
            <span>من 600 نقطة</span>
          </div>
          <div className="pe__spend-card">
            <span className="pe__spend-emoji">💵</span>
            <strong>فلوس حقيقية</strong>
            <span>قريبًا ✨</span>
          </div>
        </div>
      </div>

      <div className="pe__cta">
        <Link href="/account/points" className="pe__cta-btn">💰 شوف نقاطي</Link>
        <Link href="/account/referral" className="pe__cta-link">ادعي صحابك ←</Link>
      </div>
    </section>
  )
}
