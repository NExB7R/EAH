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
import GlobalShareAction from './global-share-action'
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
    title: 'للعميل',
    Icon: TargetIcon,
    links: [
      { href: '/', label: 'الرئيسية', Icon: TargetIcon },
      { href: '/featured', label: 'المميزون', Icon: CrownGoldIcon },
      { href: '/trends', label: 'الترند', Icon: TrendingUpIcon },
      { href: '/offers', label: 'العروض', Icon: GiftIcon },
      { href: '/new', label: 'الأنشطة الجديدة', Icon: LampIcon },
      { href: '/nearby', label: 'قريب منك', Icon: MapPinIcon },
    ],
  },
  {
    key: 'merchants',
    title: 'للتاجر',
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
        <div className={styles.contacts} role="group" aria-label="قنوات التواصل الرسمية">
          {[
            {
              key: 'whatsapp-channel',
              href: contacts.whatsappChannelUrl,
              title: 'قناة واتساب الرسمية',
              description: contacts.whatsappChannelUrl ? 'تحديثات المنصة والإعلانات' : 'سيتم التفعيل بعد اعتماد بيانات التواصل الرسمية',
              Icon: BroadcastIcon,
              tone: styles.channel,
              external: true,
            },
            {
              key: 'facebook',
              href: contacts.facebookUrl,
              title: 'صفحة EAH الرسمية',
              description: contacts.facebookUrl ? 'الأخبار والمحتوى المنشور' : 'سيتم التفعيل بعد اعتماد بيانات التواصل الرسمية',
              Icon: FacebookIcon,
              tone: styles.facebook,
              external: true,
            },
            {
              key: 'support-whatsapp',
              href: contacts.supportWhatsappUrl,
              title: 'تواصل مع الدعم',
              description: contacts.supportWhatsappUrl ? 'قناة التواصل المعتمدة للمنصة' : 'سيتم التفعيل بعد اعتماد بيانات التواصل الرسمية',
              Icon: WhatsAppIcon,
              tone: styles.whatsapp,
              external: true,
            },

          ].map(({ key, href, title, description, Icon, tone, external }) => {
            const className = [styles.card, tone, !href && styles.disabledCard]
              .filter(Boolean)
              .join(' ')
            const content = (
              <>
                <span className={styles.cardIcon}><Icon size={22} /></span>
                <span className={styles.cardBody}>
                  <strong className={styles.cardTitle}>{title}</strong>
                  <small className={styles.cardSub}>{description}</small>
                </span>
              </>
            )

            return href ? (
              <a
                key={key}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className={className}
              >
                {content}
                <ArrowLeftIcon size={14} className={styles.cardArrow} />
              </a>
            ) : (
              <div key={key} className={className} aria-disabled="true">
                {content}
                <span className={styles.disabledStatus}>قريبًا</span>
              </div>
            )
          })}
        </div>

        <div className={styles.sharePlatform}>
          <GlobalShareAction className={styles.shareAction} label="شارك منصة EAH ورمز الاستجابة السريعة" />
        </div>

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
