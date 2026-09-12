'use client'
import EahLogo from './eah-logo'
import { IconFacebook, IconWhatsapp } from './neon-icons'
import './site-footer.css'

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">

        <div className="site-footer__brand">
          <EahLogo size="md" variant="full" />
        </div>

        <div className="site-footer__serve">
          <h3 className="site-footer__serve-title">كيف نخدمك؟</h3>
          <div className="site-footer__serve-grid">
            <div className="site-footer__serve-item">
              <span className="site-footer__serve-icon">🎯</span>
              <p><strong>نوصّلك الصح</strong> — بنفهم مزاجك ونرشحلك الأماكن اللي تناسبك</p>
            </div>
            <div className="site-footer__serve-item">
              <span className="site-footer__serve-icon">💜</span>
              <p><strong>بنسمعك</strong> — كل اقتراح وتعليق بيوصلنا، وبتبني عليه المنصة</p>
            </div>
            <div className="site-footer__serve-item">
              <span className="site-footer__serve-icon">⚡</span>
              <p><strong>تجربة سريعة</strong> — من غير تعقيد، من غير تسجيل طويل</p>
            </div>
            <div className="site-footer__serve-item">
              <span className="site-footer__serve-icon">🤝</span>
              <p><strong>دعم للأماكن المحلية</strong> — بنخلي البزنس الصغير يكبر معاك</p>
            </div>
          </div>
        </div>

        <nav className="site-footer__nav" aria-label="روابط الموقع">
          <div className="site-footer__col">
            <h4>EAH</h4>
            <a href="/about">نبذة عننا</a>
            <a href="/contact">تواصل معنا</a>
            <a href="/advertise">أعلن معنا</a>
            <a href="/merchant/apply">سجّل متجرك</a>
          </div>
          <div className="site-footer__col">
            <h4>اكتشف</h4>
            <a href="/explore">اكتشف</a>
            <a href="/recommend">نفسك في ايه؟</a>
            <a href="/offers">العروض</a>
            <a href="/trends">الترندات</a>
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
              <a href="#" aria-label="فيسبوك" className="site-footer__social-btn">
                <IconFacebook />
              </a>
              <a href="#" aria-label="واتساب" className="site-footer__social-btn">
                <IconWhatsapp />
              </a>
            </div>
          </div>
        </nav>

        <div className="site-footer__palestine">
          <p className="site-footer__palestine-text">فلسطين في قلبنا</p>
          <p className="site-footer__palestine-sub">الحرية قادمة .. بإذن الله</p>
          <button type="button" className="site-footer__heart" aria-label="فلسطين">
            <svg viewBox="0 0 32 28" width="52" height="45" aria-hidden>
              <defs>
                <clipPath id="heart-clip">
                  <path d="M16 27S2 18 2 10a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 8-14 17-14 17Z" />
                </clipPath>
              </defs>
              <g clipPath="url(#heart-clip)" className="heart-fill">
                <rect x="0" y="0" width="32" height="9" fill="#000000" />
                <rect x="0" y="9" width="32" height="9" fill="#FFFFFF" />
                <rect x="0" y="18" width="32" height="10" fill="#149954" />
                <polygon points="0,0 10,14 0,28" fill="#E4312B" />
              </g>
              <path
                d="M16 27S2 18 2 10a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 8-14 17-14 17Z"
                fill="none"
                stroke="#A855F7"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__bottom-brand">EAH</p>
          <p>© {year} — صُنع بكل حب</p>
        </div>

      </div>
    </footer>
  )
}
