import Link from 'next/link'
import Logo from './logo'
import Signature from './signature'
import PalestineHeart from './palestine-heart'
import {
  WhatsAppIcon,
  FacebookIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowLeftIcon,
  TargetIcon,
  CrownGoldIcon,
  TrendingUpIcon,
  GiftIcon,
  LampIcon,
  StoreIcon,
  FileTextIcon,
  ShieldCheckIcon,
  CookieIcon,
} from './icons'
import styles from './site-footer.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Site Footer (Premium 2026)
// ═══════════════════════════════════════════════════════════

const APP_VERSION = 'v2.1.0'

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.glow} aria-hidden />

      <div className={styles.container}>
        {/* ─── اللوجو + السلوغان ─── */}
        <div className={styles.top}>
          <Link href="/" aria-label="EAH — الرئيسية" className={styles.logoWrap}>
            <Logo size="md" />
          </Link>
        </div>

        {/* ─── 3 كروت تواصل ─── */}
        <div className={styles.contactRow}>
          <a
            href="https://wa.me/201012892806"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.contactCard} ${styles.whatsapp}`}
          >
            <span className={styles.contactIcon}>
              <WhatsAppIcon size={22} />
            </span>
            <span className={styles.contactText}>
              <span className={styles.contactLabel}>واتساب</span>
              <span className={styles.contactValue}>كلمنا دلوقتي</span>
            </span>
            <ArrowLeftIcon size={14} className={styles.contactArrow} />
          </a>

          <a
            href="https://facebook.com/eah"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.contactCard} ${styles.facebook}`}
          >
            <span className={styles.contactIcon}>
              <FacebookIcon size={22} />
            </span>
            <span className={styles.contactText}>
              <span className={styles.contactLabel}>فيسبوك</span>
              <span className={styles.contactValue}>تابعنا</span>
            </span>
            <ArrowLeftIcon size={14} className={styles.contactArrow} />
          </a>

          <a
            href="tel:+201012892806"
            className={`${styles.contactCard} ${styles.phone}`}
          >
            <span className={styles.contactIcon}>
              <PhoneIcon size={22} />
            </span>
            <span className={styles.contactText}>
              <span className={styles.contactLabel}>اتصال</span>
              <span className={styles.contactValue}>اتكلم معانا</span>
            </span>
            <ArrowLeftIcon size={14} className={styles.contactArrow} />
          </a>
        </div>

        {/* ─── Links ─── */}
        <div className={styles.links}>
          <Link href="/" className={styles.link}>
            <TargetIcon size={14} />
            <span>اكتشف</span>
          </Link>
          <Link href="/featured" className={styles.link}>
            <CrownGoldIcon size={14} />
            <span>المميزون</span>
          </Link>
          <Link href="/trends" className={styles.link}>
            <TrendingUpIcon size={14} />
            <span>الترند</span>
          </Link>
          <Link href="/offers" className={styles.link}>
            <GiftIcon size={14} />
            <span>العروض</span>
          </Link>
          <Link href="/new" className={styles.link}>
            <LampIcon size={14} />
            <span>الجديد</span>
          </Link>
          <Link href="/nearby" className={styles.link}>
            <MapPinIcon size={14} />
            <span>قريب منك</span>
          </Link>
          <Link href="/merchant/apply" className={styles.link}>
            <StoreIcon size={14} />
            <span>سجّل نشاطك</span>
          </Link>
          <Link href="/pricing" className={styles.link}>
            <FileTextIcon size={14} />
            <span>الباقات</span>
          </Link>
          <Link href="/advertise" className={styles.link}>
            <TrendingUpIcon size={14} />
            <span>أعلن معانا</span>
          </Link>
          <Link href="/faq" className={styles.link}>
            <ShieldCheckIcon size={14} />
            <span>الأسئلة</span>
          </Link>
          <Link href="/terms" className={styles.link}>
            <FileTextIcon size={14} />
            <span>الشروط</span>
          </Link>
          <Link href="/privacy" className={styles.link}>
            <ShieldCheckIcon size={14} />
            <span>الخصوصية</span>
          </Link>
          <Link href="/cookies" className={styles.link}>
            <CookieIcon size={14} />
            <span>الكوكيز</span>
          </Link>
          <Link href="/contact" className={styles.link}>
            <PhoneIcon size={14} />
            <span>تواصل معانا</span>
          </Link>
        </div>

        {/* ─── شريط فلسطين ─── */}
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
