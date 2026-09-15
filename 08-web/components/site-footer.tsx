'use client'
import EahLogo from './eah-logo'
import { IconFacebook, IconWhatsapp } from './neon-icons'
import './site-footer.css'

export default function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand"><EahLogo size="md" variant="full" href="/" /></div>

        {/* فلسطين — compact */}
        <a
          href="/support-palestine"
          className="site-footer__palestine-compact"
          aria-label="فلسطين في القلب — اضغط للتفاصيل"
        >
          <span className="site-footer__palestine-label">فلسطين في القلب</span>
          <span className="site-footer__palestine-heart" aria-hidden>
            <svg viewBox="0 0 32 28" width="22" height="20">
              <defs>
                <clipPath id="ps-heart-clip">
                  <path d="M16 27S2 18 2 10a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 8-14 17-14 17Z" />
                </clipPath>
              </defs>
              <g clipPath="url(#ps-heart-clip)">
                <rect x="0" y="0" width="32" height="9" fill="#000" />
                <rect x="0" y="9" width="32" height="9" fill="#FFF" />
                <rect x="0" y="18" width="32" height="10" fill="#149954" />
                <polygon points="0,0 10,14 0,28" fill="#E4312B" />
              </g>
              <path
                d="M16 27S2 18 2 10a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 8-14 17-14 17Z"
                fill="none"
                stroke="#A855F7"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>

        {/* كيف نخدمك */}
        <div className="site-footer__serve">
          <h3 className="site-footer__serve-title">كيف نخدمك؟</h3>
          <div className="site-footer__serve-grid">
            <div className="site-footer__serve-item"><span className="site-footer__serve-icon">🎯</span><p><strong>نوصّلك الصح</strong> — بنفهم مزاجك ونرشحلك الأماكن اللي تناسبك</p></div>
            <div className="site-footer__serve-item"><span className="site-footer__serve-icon">💜</span><p><strong>بنسمعك</strong> — كل اقتراح وتعليق بيوصلنا، وبتبني عليه المنصة</p></div>
            <div className="site-footer__serve-item"><span className="site-footer__serve-icon">⚡</span><p><strong>تجربة سريعة</strong> — من غير تعقيد، من غير تسجيل طويل</p></div>
            <div className="site-footer__serve-item"><span className="site-footer__serve-icon">🤝</span><p><strong>دعم للأماكن المحلية</strong> — بنخلي البزنس الصغير يكبر معاك</p></div>
          </div>
        </div>

        {/* الروابط — تحت "كيف نخدمك" */}
        <nav className="site-footer__nav">
          <div className="site-footer__col">
            <h4>EAH</h4>
            <a href="/about">نبذة عننا</a>
            <a href="/contact">تواصل معنا</a>
            <a href="/advertise">أعلن معنا</a>
            <a href="/pricing">الباقات والأسعار</a>
            <a href="/merchant/apply">سجّل متجرك</a>
          </div>
          <div className="site-footer__col">
            <h4>قانوني</h4>
            <a href="/terms">الشروط والأحكام</a>
            <a href="/privacy">سياسة الخصوصية</a>
            <a href="/cookies">ملفات تعريف الارتباط</a>
          </div>
          <div className="site-footer__col">
            <h4>تابعنا</h4>
            <div className="site-footer__social">
              <a href="#" aria-label="فيسبوك" className="site-footer__social-btn"><IconFacebook /></a>
              <a href="#" aria-label="واتساب" className="site-footer__social-btn"><IconWhatsapp /></a>
            </div>
          </div>
        </nav>

        <div className="site-footer__bottom">
          <p className="site-footer__bottom-made">
            صُنع بكل حب
            <svg className="site-footer__neon-heart" viewBox="0 0 32 28" width="20" height="18" aria-hidden>
              <defs><linearGradient id="neon-heart-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#A855F7" /><stop offset="100%" stopColor="#6B21FF" /></linearGradient></defs>
              <path d="M16 27S2 18 2 10a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 8-14 17-14 17Z" fill="url(#neon-heart-grad)" stroke="rgba(168,85,247,0.8)" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </p>
          <p className="site-footer__bottom-copy">© {year} — جميع الحقوق محفوظة</p>
          <p className="site-footer__signature" aria-label="توقيع المطور">
            <span className="site-footer__signature-text">NourEldin B7R</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
