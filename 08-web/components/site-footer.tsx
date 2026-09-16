'use client'
import EahLogo from './eah-logo'
import { IconFacebook, IconWhatsapp } from './neon-icons'
import { CONTACT_CHANNELS, waLink } from '@/app/contact/contact-channels'
import './site-footer.css'

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="sf">
      <div className="sf__inner">
        {/* Brand row */}
        <div className="sf__brand-row">
          <EahLogo size="md" variant="full" href="/" />
          </div>

        {/* Nav grid */}
        <nav className="sf__nav">
          <div className="sf__col">
            <h4 className="sf__col-title">EAH</h4>
            <a href="/about" className="sf__link">نبذة عننا</a>
            <a href="/contact" className="sf__link">تواصل معنا</a>
            <a href="/advertise" className="sf__link">أعلن معنا</a>
            <a href="/pricing" className="sf__link">الباقات والأسعار</a>
          </div>

          <div className="sf__col">
            <h4 className="sf__col-title">للأعمال</h4>
            <a href="/merchant-info" className="sf__link">مميزات لأصحاب الأنشطة</a>
            <a href="/merchant/apply" className="sf__link">سجّل نشاطك</a>
            <a href="/merchant-info" className="sf__link">الباقات</a>
            <a href="/advertise" className="sf__link">إعلانات</a>
          </div>

          <div className="sf__col">
            <h4 className="sf__col-title">قانوني</h4>
            <a href="/terms" className="sf__link">الشروط والأحكام</a>
            <a href="/privacy" className="sf__link">سياسة الخصوصية</a>
            <a href="/cookies" className="sf__link">ملفات تعريف الارتباط</a>
          </div>

          <div className="sf__col">
            <h4 className="sf__col-title">تابعنا</h4>
            <div className="sf__social">
              <a
                href={waLink('السلام عليكم، تابعت EAH وعايز أعرف أكتر')}
                target="_blank"
                rel="noreferrer"
                className="sf__social-btn sf__social-btn--wa"
                aria-label="واتساب"
              >
                <IconWhatsapp />
              </a>
              <a
                href={CONTACT_CHANNELS.facebook.page}
                target="_blank"
                rel="noreferrer"
                className="sf__social-btn sf__social-btn--fb"
                aria-label="فيسبوك"
              >
                <IconFacebook />
              </a>
            </div>
            <a
              href={CONTACT_CHANNELS.whatsapp.channel}
              target="_blank"
              rel="noreferrer"
              className="sf__channel-link"
            >
              📣 قناة واتساب
            </a>
          </div>
        </nav>

        {/* Palestine + bottom row */}
        <div className="sf__bottom">
          <a
            href="/support-palestine"
            className="sf__palestine"
            aria-label="فلسطين في القلب"
          >
            <span className="sf__palestine-label">فلسطين في القلب</span>
            <span className="sf__palestine-heart" aria-hidden>
              <svg viewBox="0 0 32 28" width="20" height="18">
                <defs>
                  <clipPath id="sf-ps-clip">
                    <path d="M16 27S2 18 2 10a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 8-14 17-14 17Z" />
                  </clipPath>
                </defs>
                <g clipPath="url(#sf-ps-clip)">
                  <rect x="0" y="0" width="32" height="9" fill="#000" />
                  <rect x="0" y="9" width="32" height="9" fill="#FFF" />
                  <rect x="0" y="18" width="32" height="10" fill="#149954" />
                  <polygon points="0,0 10,14 0,28" fill="#E4312B" />
                </g>
                <path
                  d="M16 27S2 18 2 10a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 8-14 17-14 17Z"
                  fill="none" stroke="#A855F7" strokeWidth="1.4" strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>

          <div className="sf__legal">
            <p className="sf__copy">© {year} EAH — جميع الحقوق محفوظة <span className="sf__version">v0.3.6</span></p>
            <p className="sf__signature">
              <span className="sf__signature-text">NourEldin B7R</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
