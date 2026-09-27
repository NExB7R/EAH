import Link from 'next/link'
import SecondaryHero from './secondary-hero'
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
  ArrowLeftIcon,
} from './icons'
import styles from './site-footer.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Site Footer (Premium 2026 — Final)
// ═══════════════════════════════════════════════════════════

const APP_VERSION = 'v2.1.0'

const CONTACTS = {
  channel: 'https://whatsapp.com/channel/eaH',
  facebook: 'https://facebook.com/eah.eg',
  whatsapp: 'https://wa.me/201012892806',
}

const COLUMNS = [
  {
    key: 'discover',
    title: 'للعملاء',
    Icon: TargetIcon,
    links: [
      { href: '/', label: 'الرئيسية', Icon: TargetIcon },
      { href: '/featured', label: 'المميزون', Icon: CrownGoldIcon },
      { href: '/trends', label: 'الترند', Icon: TrendingUpIcon },
      { href: '/offers', label: 'العروض', Icon: GiftIcon },
      { href: '/new', label: 'الجديد', Icon: LampIcon },
      { href: '/nearby', label: 'قريب منك', Icon: MapPinIcon },
    ],
  },
  {
    key: 'merchants',
    title: 'للتجار',
    Icon: StoreIcon,
    links: [
      { href: '/merchant/apply', label: 'سجّل نشاطك', Icon: StoreIcon },
      { href: '/pricing', label: 'الباقات', Icon: FileTextIcon },
      { href: '/advertise', label: 'أعلن معانا', Icon: TrendingUpIcon },
      { href: '/faq', label: 'الأسئلة', Icon: ShieldCheckIcon },
    ],
  },
  {
    key: 'about',
    title: 'عننا',
    Icon: ShieldCheckIcon,
    links: [
      { href: '/about', label: 'مين إحنا', Icon: ShieldCheckIcon },
      { href: '/contact', label: 'تواصل معانا', Icon: PhoneIcon },
      { href: '/support-palestine', label: 'دعم فلسطين', Icon: MapPinIcon },
    ],
  },
  {
    key: 'legal',
    title: 'قانوني',
    Icon: FileTextIcon,
    links: [
      { href: '/terms', label: 'الشروط', Icon: FileTextIcon },
      { href: '/privacy', label: 'الخصوصية', Icon: ShieldCheckIcon },
      { href: '/cookies', label: 'الكوكيز', Icon: CookieIcon },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.glow} aria-hidden />

      {/* ─── Secondary Hero ─── */}
      <div className={styles.heroWrap}>
        <SecondaryHero showNav={false} />
      </div>

      <div className={styles.container}>
        {/* ─── Contact Cards ─── */}
        <div className={styles.contacts}>
          <a
            href={CONTACTS.channel}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.card} ${styles.channel}`}
          >
            <span className={styles.cardIcon}>
              <BroadcastIcon size={22} />
            </span>
            <span className={styles.cardBody}>
              <strong className={styles.cardTitle}>قناة الواتساب</strong>
              <small className={styles.cardSub}>أول ما ينزل عرض — إنت أول واحد يعرف</small>
            </span>
            <ArrowLeftIcon size={14} className={styles.cardArrow} />
          </a>

          <a
            href={CONTACTS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.card} ${styles.facebook}`}
          >
            <span className={styles.cardIcon}>
              <FacebookIcon size={22} />
            </span>
            <span className={styles.cardBody}>
              <strong className={styles.cardTitle}>صفحة فيسبوك</strong>
              <small className={styles.cardSub}>أخبار EAH وفرص للشركاء</small>
            </span>
            <ArrowLeftIcon size={14} className={styles.cardArrow} />
          </a>

          <a
            href={CONTACTS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.card} ${styles.whatsapp}`}
          >
            <span className={styles.cardIcon}>
              <WhatsAppIcon size={22} />
            </span>
            <span className={styles.cardBody}>
              <strong className={styles.cardTitle}>كلم المسؤول</strong>
              <small className={styles.cardSub}>رد خلال دقايق — بدون لف</small>
            </span>
            <ArrowLeftIcon size={14} className={styles.cardArrow} />
          </a>
        </div>

        {/* ─── Columns (centered premium) ─── */}
        <nav className={styles.columns} aria-label="روابط الفوتر">
          {COLUMNS.map(({ key, title, Icon, links }) => (
            <div key={key} className={styles.col}>
              <h4 className={styles.colTitle}>
                <span className={styles.colIcon}>
                  <Icon size={14} />
                </span>
                <span>{title}</span>
              </h4>
              <ul className={styles.colList}>
                {links.map(({ href, label, Icon: LIcon }) => (
                  <li key={href}>
                    <Link href={href} className={styles.colLink}>
                      <LIcon size={12} />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ─── Palestine ─── */}
        <div className={styles.palestine}>
          <PalestineHeart />
        </div>

        {/* ─── Signature ─── */}
        <div className={styles.signature}>
          <Signature />
        </div>

        {/* ─── Bottom ─── */}
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
