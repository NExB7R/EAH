import Link from 'next/link'
import { shouldRenderPublicChrome } from '@/lib/navigation/public-chrome'
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
import { APP_VERSION } from '@/lib/version'
import { getAppTexts } from '@/lib/data/app-texts'
import { getPublicContactSettings } from '@/lib/data/site-settings'

// ═══════════════════════════════════════════════════════════
// EAH — Site Footer (Premium 2026 — Final)
// ═══════════════════════════════════════════════════════════

// §26 — نسخة واحدة من lib/version.ts

const COLUMNS = [
  {
    key: 'customers',
    title: 'للمشتري',
    Icon: TargetIcon,
    links: [
      { href: '/', label: 'الرئيسية', Icon: TargetIcon },
      { href: '/featured', label: 'المميزون', Icon: CrownGoldIcon },
      { href: '/trends', label: 'الترند', Icon: TrendingUpIcon },
      { href: '/offers', label: 'العروض', Icon: GiftIcon },
      { href: '/new', label: 'بدايات', Icon: LampIcon },
      { href: '/nearby', label: 'قريب منك', Icon: MapPinIcon },
    ],
  },
  {
    key: 'merchants',
    title: 'للبايع',
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
      { href: '/trust', label: 'السمعة والتوثيق', Icon: ShieldCheckIcon },
      { href: '/contact', label: 'تواصل معانا', Icon: PhoneIcon },
      { href: '/support-palestine', label: 'دعم فلسطين', Icon: MapPinIcon },
      { href: '/help', label: 'المساعدة', Icon: ShieldCheckIcon },
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

export default async function SiteFooter() {
  if (!(await shouldRenderPublicChrome())) return null

  const [texts, contacts] = await Promise.all([getAppTexts(), getPublicContactSettings()])
  return (
    <footer className={styles.footer}>
      <div className={styles.glow} aria-hidden />

      {/* ─── Secondary Hero (بدون nav) ─── */}
      <div className={styles.heroWrap}>
        <SecondaryHero showNav={false} compact />
      </div>

      <div className={styles.container}>
        {contacts.enabled ? (
          <div className={styles.contacts} aria-label="قنوات التواصل الرسمية">
            {contacts.whatsappChannelUrl && (
              <a href={contacts.whatsappChannelUrl} target="_blank" rel="noopener noreferrer" className={`${styles.card} ${styles.channel}`}>
                <span className={styles.cardIcon}><BroadcastIcon size={22} /></span>
                <span className={styles.cardBody}>
                  <strong className={styles.cardTitle}>قناة واتساب الرسمية</strong>
                  <small className={styles.cardSub}>تحديثات المنصة والإعلانات</small>
                </span>
                <ArrowLeftIcon size={14} className={styles.cardArrow} />
              </a>
            )}
            {contacts.facebookUrl && (
              <a href={contacts.facebookUrl} target="_blank" rel="noopener noreferrer" className={`${styles.card} ${styles.facebook}`}>
                <span className={styles.cardIcon}><FacebookIcon size={22} /></span>
                <span className={styles.cardBody}>
                  <strong className={styles.cardTitle}>صفحة EAH الرسمية</strong>
                  <small className={styles.cardSub}>الأخبار والمحتوى المنشور</small>
                </span>
                <ArrowLeftIcon size={14} className={styles.cardArrow} />
              </a>
            )}
            {contacts.supportWhatsappUrl && (
              <a href={contacts.supportWhatsappUrl} target="_blank" rel="noopener noreferrer" className={`${styles.card} ${styles.whatsapp}`}>
                <span className={styles.cardIcon}><WhatsAppIcon size={22} /></span>
                <span className={styles.cardBody}>
                  <strong className={styles.cardTitle}>تواصل مع الدعم</strong>
                  <small className={styles.cardSub}>قناة التواصل المعتمدة للمنصة</small>
                </span>
                <ArrowLeftIcon size={14} className={styles.cardArrow} />
              </a>
            )}
            {contacts.email && (
              <a href={`mailto:${contacts.email}`} className={`${styles.card} ${styles.email}`}>
                <span className={styles.cardIcon}><PhoneIcon size={22} /></span>
                <span className={styles.cardBody}>
                  <strong className={styles.cardTitle}>إيميل الدعم</strong>
                  <small className={styles.cardSub}>{contacts.email}</small>
                </span>
                <ArrowLeftIcon size={14} className={styles.cardArrow} />
              </a>
            )}
          </div>
        ) : (
          <div className={styles.contactNotice}>
            <span>قنوات التواصل الرسمية هتظهر هنا بعد اعتماد بياناتها.</span>
            <Link href="/help">مركز المساعدة</Link>
          </div>
        )}

        {/* ─── Columns ─── */}
        <nav className={styles.columns} aria-label="روابط الفوتر">
          {COLUMNS.map(({ key, title, Icon, links }) => (
            <div key={key} className={styles.col}>
              <h2 className={styles.colTitle}>
                <span className={styles.colIcon}>
                  <Icon size={14} />
                </span>
                <span>{title}</span>
              </h2>
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
          <p className={styles.copyright}>{texts.footer_copyright}</p>
          <span className={styles.version}>{APP_VERSION}</span>
        </div>
      </div>
    </footer>
  )
}
