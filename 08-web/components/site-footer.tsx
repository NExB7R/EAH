'use client'
import EahLogo from './eah-logo'
import { IconFacebook, IconWhatsapp } from './neon-icons'
import './site-footer.css'

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">

        {/* الشعار */}
        <div className="site-footer__brand">
          <EahLogo size="md" variant="full" />
        </div>

        {/* روابط */}
        <nav className="site-footer__nav" aria-label="روابط الموقع">
          <div className="site-footer__col">
            <h4>EAH</h4>
            <a href="/about">نبذة عننا</a>
            <a href="/contact">تواصل معنا</a>
            <a href="/advertise">أعلن معنا</a>
            <a href="/merchant/apply">سجّل متجرك</a>
          </div>
          <div className="site-footer__col">
            <h4>المنصة</h4>
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

        {/* فلسطين */}
        <div className="site-footer__palestine">
          <p className="site-footer__palestine-text">فلسطين في قلبنا ❤️</p>
          <p className="site-footer__palestine-sub">الحرية قادمة .. بإذن الله</p>
          <button
            type="button"
            className="site-footer__heart"
            aria-label="فلسطين"
            onClick={(e) => e.currentTarget.classList.toggle('is-active')}
          >
            <svg viewBox="0 0 32 28" width="40" height="35" aria-hidden>
              <defs>
                <linearGradient id="ps-flag" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#000000" />
                  <stop offset="33%" stopColor="#FFFFFF" />
                  <stop offset="66%" stopColor="#149954" />
                  <stop offset="100%" stopColor="#E4312B" />
                </linearGradient>
                <clipPath id="heart-clip">
                  <path d="M16 27S2 18 2 10a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 8-14 17-14 17Z" />
                </clipPath>
              </defs>
              <path
                d="M16 27S2 18 2 10a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 8-14 17-14 17Z"
                fill="none"
                stroke="url(#ps-flag)"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <g clipPath="url(#heart-clip)" className="heart-fill">
                <rect x="0" y="0" width="32" height="9" fill="#000" opacity="0" />
                <rect x="0" y="9" width="32" height="9" fill="#FFFFFF" opacity="0" />
                <rect x="0" y="18" width="32" height="9" fill="#149954" opacity="0" />
                <polygon points="0,0 10,14 0,28" fill="#E4312B" opacity="0" />
              </g>
            </svg>
          </button>
        </div>

        {/* الحقوق */}
        <div className="site-footer__bottom">
          <p>© {year} EAH — اللي نفسك فيه ؟</p>
          <p className="site-footer__made">صُنع بحب في شبين القناطر 💜</p>
        </div>

      </div>
    </footer>
  )
}
