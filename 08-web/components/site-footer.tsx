'use client'
import EahLogo from './eah-logo'
import { IconFacebook, IconWhatsapp } from './neon-icons'
import { CONTACT_CHANNELS, waLink } from '@/app/contact/contact-channels'
import { APP_VERSION_LABEL } from '@/lib/version'
import { IcChat } from './eah-icons'
import './site-footer.css'

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="sf">
      <div className="sf__inner">
        <div className="sf__brand-row">
          <EahLogo size="md" variant="full" href="/" />
        </div>

        <div className="sf__follow-row">
          <a href={CONTACT_CHANNELS.whatsapp.channel} target="_blank" rel="noreferrer" className="sf__follow-card sf__follow-card--wa">
            <span className="sf__follow-emoji"<IcChat />/span>
            <div className="sf__follow-info">
              <strong>قناة الواتساب</strong>
              <small>أول ما ينزل عرض — إنت أول واحد يعرف</small>
            </div>
          </a>
          <a href={CONTACT_CHANNELS.facebook.page} target="_blank" rel="noreferrer" className="sf__follow-card sf__follow-card--fb">
            <span className="sf__follow-emoji"><IconFacebook /></span>
            <div className="sf__follow-info">
              <strong>صفحة فيسبوك</strong>
              <small>أخبار EAH وفرص للشركاء</small>
            </div>
          </a>
          <a href={waLink('السلام عليكم، عايز أتواصل مع مسئول EAH')} target="_blank" rel="noreferrer" className="sf__follow-card sf__follow-card--dm">
            <span className="sf__follow-emoji"><IconWhatsapp /></span>
            <div className="sf__follow-info">
              <strong>كلم المسئول</strong>
              <small>رد خلال دقايق — بدون لف</small>
            </div>
          </a>
        </div>

        <nav className="sf__nav">
          <div className="sf__col">
            <h4 className="sf__col-title">اكتشف</h4>
            <a href="/explore" className="sf__link">كل الأماكن</a>
            <a href="/featured" className="sf__link">المميزين</a>
            <a href="/trends" className="sf__link">الترند النهاردة</a>
            <a href="/new" className="sf__link">الجديد</a>
            <a href="/offers" className="sf__link">العروض</a>
          </div>

          <div className="sf__col">
            <h4 className="sf__col-title">لأصحاب الأنشطة</h4>
            <a href="/merchant-info" className="sf__link">ليه EAH؟</a>
            <a href="/merchant/apply" className="sf__link">سجّل نشاطك</a>
            <a href="/pricing" className="sf__link">الباقات</a>
            <a href="/advertise" className="sf__link">أعلن معانا</a>
          </div>

          <div className="sf__col">
            <h4 className="sf__col-title">عننا</h4>
            <a href="/about" className="sf__link">الكلام ع إيه</a>
            <a href="/contact" className="sf__link">تواصل معانا</a>
            <a href="/support-palestine" className="sf__link">فلسطين في القلب</a>
          </div>

          <div className="sf__col">
            <h4 className="sf__col-title">قانوني</h4>
            <a href="/terms" className="sf__link">الشروط والأحكام</a>
            <a href="/privacy" className="sf__link">سياسة الخصوصية</a>
            <a href="/cookies" className="sf__link">الكوكيز</a>
          </div>
        </nav>

        <div className="sf__bottom">
          <a href="/support-palestine" className="sf__palestine" aria-label="فلسطين في القلب">
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
                <path d="M16 27S2 18 2 10a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 8-14 17-14 17Z" fill="none" stroke="#A855F7" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </span>
          </a>

          <div className="sf__legal">
            <p className="sf__copy">© {year} EAH — جميع الحقوق محفوظة <span className="sf__version">{APP_VERSION_LABEL}</span></p>
            <p className="sf__signature"><span className="sf__signature-text">NourEldin B7R</span></p>
          </div>
        </div>
      </div>
    </footer>
  )
}

