import Link from 'next/link'
import Logo from './logo'
import Signature from './signature'
import PalestineHeart from './palestine-heart'
import {
  WhatsAppIcon,
  FacebookIcon,
  BroadcastIcon,
  TargetIcon,
  CrownGoldIcon,
  TrendingUpIcon,
  GiftIcon,
  LampIcon,
  MapPinIcon,
  StoreIcon,
  FileTextIcon,
  ShieldCheckIcon,
  CookieIcon,
  PhoneIcon,
} from './icons'
import styles from './site-footer.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Site Footer (Premium 2026 — 4 columns)
// ═══════════════════════════════════════════════════════════

const APP_VERSION = 'v2.1.0'

const SOCIAL = {
  whatsapp: 'https://wa.me/201012892806',
  facebook: 'https://facebook.com/eah',
  channel: 'https://whatsapp.com/channel/eaH',
}

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.glow} aria-hidden />

      <div className={styles.container}>
        {/* ─── اللوجو + السلوغان + السوشيال ─── */}
        <div className={styles.top}>
          <Link href="/" aria-label="EAH — الرئيسية" className={styles.logoWrap}>
            <Logo size="md" />
          </Link>

          <div className={styles.socialRow}>
            <a
              href={SOCIAL.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialBtn} ${styles.whatsapp}`}
              aria-label="واتساب"
              data-tooltip="واتساب"
            >
              <WhatsAppIcon size={20} />
            </a>

            <a
              href={SOCIAL.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialBtn} ${styles.facebook}`}
              aria-label="فيسبوك"
              data-tooltip="فيسبوك"
            >
              <FacebookIcon size={20} />
            </a>

            <a
              href={SOCIAL.channel}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialBtn} ${styles.channel}`}
              aria-label="قناة واتساب"
              data-tooltip="قناة التحديثات"
            >
              <BroadcastIcon size={20} />
            </a>
          </div>
        </div>

        {/* ─── 4 أعمدة ─── */}
        <div className={styles.columns}>
          {/* اكتشف */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>
              <TargetIcon size={14} />
              <span>اكتشف</span>
            </h4>
            <ul className={styles.colList}>
              <li>
                <Link href="/" className={styles.colLink}>
                  <TargetIcon size={12} />
                  <span>الرئيسية</span>
                </Link>
              </li>
              <li>
                <Link href="/featured" className={styles.colLink}>
                  <CrownGoldIcon size={12} />
                  <span>المميزون</span>
                </Link>
              </li>
              <li>
                <Link href="/trends" className={styles.colLink}>
                  <TrendingUpIcon size={12} />
                  <span>الترند</span>
                </Link>
              </li>
              <li>
                <Link href="/offers" className={styles.colLink}>
                  <GiftIcon size={12} />
                  <span>العروض</span>
                </Link>
              </li>
              <li>
                <Link href="/new" className={styles.colLink}>
                  <LampIcon size={12} />
                  <span>الجديد</span>
                </Link>
              </li>
              <li>
                <Link href="/nearby" className={styles.colLink}>
                  <MapPinIcon size={12} />
                  <span>قريب منك</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* للتجار */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>
              <StoreIcon size={14} />
              <span>للتجار</span>
            </h4>
            <ul className={styles.colList}>
              <li>
                <Link href="/merchant/apply" className={styles.colLink}>
                  <StoreIcon size={12} />
                  <span>سجّل نشاطك</span>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className={styles.colLink}>
                  <FileTextIcon size={12} />
                  <span>الباقات</span>
                </Link>
              </li>
              <li>
                <Link href="/advertise" className={styles.colLink}>
                  <TrendingUpIcon size={12} />
                  <span>أعلن معانا</span>
                </Link>
              </li>
              <li>
                <Link href="/faq" className={styles.colLink}>
                  <ShieldCheckIcon size={12} />
                  <span>الأسئلة</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* عن EAH */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>
              <ShieldCheckIcon size={14} />
              <span>عن EAH</span>
            </h4>
            <ul className={styles.colList}>
              <li>
                <Link href="/about" className={styles.colLink}>
                  <ShieldCheckIcon size={12} />
                  <span>مين إحنا</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.colLink}>
                  <PhoneIcon size={12} />
                  <span>تواصل معانا</span>
                </Link>
              </li>
              <li>
                <Link href="/support-palestine" className={styles.colLink}>
                  <MapPinIcon size={12} />
                  <span>دعم فلسطين</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* قانوني */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>
              <FileTextIcon size={14} />
              <span>قانوني</span>
            </h4>
            <ul className={styles.colList}>
              <li>
                <Link href="/terms" className={styles.colLink}>
                  <FileTextIcon size={12} />
                  <span>الشروط</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={styles.colLink}>
                  <ShieldCheckIcon size={12} />
                  <span>الخصوصية</span>
                </Link>
              </li>
              <li>
                <Link href="/cookies" className={styles.colLink}>
                  <CookieIcon size={12} />
                  <span>الكوكيز</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── فلسطين ─── */}
        <div className={styles.palestine}>
          <PalestineHeart />
        </div>

        {/* ─── التوقيع ─── */}
        <div className={styles.signature}>
          <Signature />
        </div>

        {/* ─── الحقوق ─── */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2026 EAH — كل الحقوق محفوظة
          </p>
          <span className={styles.version}>{APP_VERSION}</span>
        </div>
      </div>
    </footer>
  )
}
