'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HomeIcon,
  CompassIcon,
  StarIcon,
  TagIcon,
  TrendingUpIcon,
  SparklesIcon,
  BellIcon,
  InfoIcon,
  InstallIcon,
  LogoutIcon,
  CloseIcon,
  BadgeCheckIcon,
  ArrowLeftIcon,
  ExternalLinkIcon,
  FacebookIcon,
  WhatsAppIcon,
  ShieldIcon,
  FileTextIcon,
  CookieIcon,
  TargetIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  CrownGoldIcon,
  LocationIcon,
  MapPinIcon,
  QrCodeIcon,
  SettingsIcon,
  StoreIcon,
  GiftIcon,
  HelpCircleIcon,
} from './icons'
import Avatar from './avatar'
import Logo from './logo'
import GlobalShareAction from './global-share-action'
import type { UserSession } from '@/lib/data/user'
import type { PublicContactLinks } from '@/lib/data/site-settings'
import { getTrustTierMeta } from '@/lib/trust'
import styles from './menu-drawer.module.css'

type Props = {
  open: boolean
  onClose: () => void
  session: UserSession | null
  contactLinks: PublicContactLinks
}

type MenuItem = {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

// ─── Public (للجميع) ───
const PUBLIC_ITEMS: MenuItem[] = [
  { href: '/', label: 'الرئيسية', Icon: HomeIcon },
  { href: '/explore', label: 'اكتشف الأماكن والأنشطة', Icon: CompassIcon },
  { href: '/nearby', label: 'قريب منك', Icon: LocationIcon },
  { href: '/offers', label: 'العروض', Icon: TagIcon },
  { href: '/featured', label: 'المميزون', Icon: StarIcon },
  { href: '/trends', label: 'الترند', Icon: TrendingUpIcon },
  { href: '/new', label: 'بدايات جديدة', Icon: SparklesIcon },
  { href: '/suggest', label: 'ارشحلك', Icon: TargetIcon },
  { href: '/trust', label: 'السمعة والتوثيق', Icon: ShieldCheckIcon },
]

// ─── روابط الحساب المشتركة (المشتري والبايع) ───
const ACCOUNT_ITEMS: MenuItem[] = [
  { href: '/account', label: 'حسابي', Icon: LayoutDashboardIcon },
  { href: '/account/orders', label: 'طلباتي', Icon: FileTextIcon },
  { href: '/account/favorites', label: 'المفضلات', Icon: StarIcon },
  { href: '/account/following', label: 'المتابعات', Icon: StoreIcon },
  { href: '/account/notifications', label: 'الإشعارات', Icon: BellIcon },
  { href: '/account/points', label: 'النقاط', Icon: GiftIcon },
]

// ─── مساحة عمل البايع: تطابق الروابط قائمة MerchantSidebar ───
const SELLER_SECTION: MenuItem[] = [
  { href: '/merchant', label: 'نظرة عامة', Icon: LayoutDashboardIcon },
  { href: '/merchant/business', label: 'بيانات النشاط', Icon: StoreIcon },
  { href: '/merchant/branches', label: 'الفروع', Icon: MapPinIcon },
  { href: '/merchant/orders', label: 'الطلبات', Icon: FileTextIcon },
  { href: '/merchant/offers', label: 'العروض', Icon: GiftIcon },
  { href: '/merchant/ads', label: 'الإعلانات', Icon: TagIcon },
  { href: '/merchant/qr', label: 'رمز QR للنشاط', Icon: QrCodeIcon },
  { href: '/merchant/insights', label: 'المساعد الذكي', Icon: SparklesIcon },
  { href: '/merchant/trust', label: 'سمعة النشاط', Icon: ShieldCheckIcon },
  { href: '/merchant/subscription', label: 'الباقة والاشتراك', Icon: CrownGoldIcon },
  { href: '/merchant/settings', label: 'إعدادات النشاط', Icon: SettingsIcon },
  { href: '/account/notifications', label: 'الإشعارات', Icon: BellIcon },
]

// ─── بداية البايع (للزائر أو المشتري الذي ليس لديه نشاط) ───
const SELLER_ONBOARDING_ITEMS: MenuItem[] = [
  { href: '/merchant/apply', label: 'سجّل نشاطك', Icon: StoreIcon },
  { href: '/pricing', label: 'الباقات', Icon: GiftIcon },
  { href: '/advertise', label: 'أعلن معانا', Icon: TrendingUpIcon },
]

// ─── Admin ───
const ADMIN_ITEMS: MenuItem[] = [
  { href: '/admin', label: 'لوحة الأدمن', Icon: ShieldCheckIcon },
  { href: '/admin/businesses/new', label: 'إضافة نشاط', Icon: StoreIcon },
]

const BOTTOM_ITEMS: MenuItem[] = [
  { href: '/about', label: 'مين إحنا', Icon: InfoIcon },
  { href: '/faq', label: 'الأسئلة الشائعة', Icon: HelpCircleIcon },
  { href: '/contact', label: 'تواصل معانا', Icon: WhatsAppIcon },
  { href: '/support-palestine', label: 'فلسطين في القلب', Icon: LocationIcon },
]

const LEGAL_ITEMS: MenuItem[] = [
  { href: '/terms', label: 'الشروط والأحكام', Icon: FileTextIcon },
  { href: '/privacy', label: 'سياسة الخصوصية', Icon: ShieldIcon },
  { href: '/cookies', label: 'ملفات الكوكيز', Icon: CookieIcon },
]


const ALL_MENU_ITEMS: MenuItem[] = [
  ...PUBLIC_ITEMS,
  ...ACCOUNT_ITEMS,
  ...SELLER_SECTION,
  ...SELLER_ONBOARDING_ITEMS,
  ...ADMIN_ITEMS,
  ...BOTTOM_ITEMS,
  ...LEGAL_ITEMS,
]

function getActiveMenuHref(pathname: string): string | null {
  const candidates = [...new Set(ALL_MENU_ITEMS.map(({ href }) => href.split('?')[0] || href))]
  const matching = candidates
    .filter((path) =>
      path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`),
    )
    .sort((a, b) => b.length - a.length)

  return matching[0] ?? null
}

export default function MenuDrawer({ open, onClose, session, contactLinks }: Props) {
  const pathname = usePathname()
  const activeHref = getActiveMenuHref(pathname)
  const router = useRouter()

  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    onCloseRef.current()
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const isLoggedIn = !!session
  const isAdmin = session?.role === 'super_admin'
  const isSeller = session?.role === 'merchant'

  const handleInstall = () => {
    window.dispatchEvent(new CustomEvent('eah:show-install'))
    onClose()
  }

  const handleLogout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST' })
      router.push('/')
    } catch {
      // ignore
    }
  }

  if (!open) return null

  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? 'v2.1.0'

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden />

      <aside className={styles.drawer} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <Link href="/" onClick={onClose} aria-label="EAH">
            <Logo size="xs" variant="compact" href={null} />
          </Link>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">
            <CloseIcon size={20} />
          </button>
        </div>

        {session && (
          <Link
            href={isAdmin ? '/admin' : '/account'}
            className={styles.profileSection}
            onClick={onClose}
          >
            <Avatar
              displayName={session.displayName}
              avatarUrl={session.avatarUrl}
              role={session.role}
              isVerified={session.isVerified}
              isPaidMember={session.isPaidMember}
              size="lg"
            />
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>
                <span>{session.displayName}</span>
                {session.isVerified && (
                  <span className={styles.verifiedIcon}>
                    <BadgeCheckIcon size={14} />
                  </span>
                )}
              </div>
              {!isAdmin && (
                <div className={styles.profileStats}>
                  <span>نقاط المشاركة {session.trustScore}</span>
                  <span className={styles.dot}>·</span>
                  <span>{getTrustTierMeta(session.trustScore).label}</span>
                </div>
              )}
            </div>
            <span className={styles.chevron}>
              <ArrowLeftIcon size={18} />
            </span>
          </Link>
        )}

        <nav className={styles.nav}>
          {/* Public */}
          <ul className={styles.list}>
            {PUBLIC_ITEMS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={styles.item}
                  aria-current={activeHref === (href.split('?')[0] || href) ? 'page' : undefined}
                  onClick={onClose}
                >
                  <span className={styles.itemIcon}>
                    <Icon size={20} />
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* روابط الحساب للمشتري والبايع المسجلين */}
          {isLoggedIn && !isAdmin && (
            <>
              <div className={styles.divider} />
              <div className={styles.sectionLabel}>
                <LayoutDashboardIcon size={14} />
                <span>حسابي</span>
              </div>
              <ul className={styles.list}>
                {ACCOUNT_ITEMS.filter(({ href }) => !(isSeller && href === '/account/notifications')).map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link
                  href={href}
                  className={styles.item}
                  aria-current={activeHref === (href.split('?')[0] || href) ? 'page' : undefined}
                  onClick={onClose}
                >
                      <span className={styles.itemIcon}>
                        <Icon size={20} />
                      </span>
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* مساحة عمل البايع المرتبط بنشاط */}
          {isSeller && (
            <>
              <div className={styles.divider} />
              <div className={styles.sectionLabel}>
                <StoreIcon size={14} />
                <span>نشاطي</span>
              </div>
              <ul className={styles.list}>
                {SELLER_SECTION.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link
                  href={href}
                  className={styles.item}
                  aria-current={activeHref === (href.split('?')[0] || href) ? 'page' : undefined}
                  onClick={onClose}
                >
                      <span className={styles.itemIcon}>
                        <Icon size={20} />
                      </span>
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* تسجيل نشاط للمشتري المسجل الذي لا يملك نشاطًا */}
          {isLoggedIn && !isSeller && !isAdmin && (
            <>
              <div className={styles.divider} />
              <div className={styles.sectionLabel}>
                <StoreIcon size={14} />
                <span>سجّل نشاطك</span>
              </div>
              <ul className={styles.list}>
                {SELLER_ONBOARDING_ITEMS.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link
                  href={href}
                  className={styles.item}
                  aria-current={activeHref === (href.split('?')[0] || href) ? 'page' : undefined}
                  onClick={onClose}
                >
                      <span className={styles.itemIcon}>
                        <Icon size={20} />
                      </span>
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* الزائر غير المسجل — يمكنه بدء تسجيل نشاط */}
          {!isLoggedIn && (
            <>
              <div className={styles.divider} />
              <div className={styles.sectionLabel}>
                <StoreIcon size={14} />
                <span>للبايع</span>
              </div>
              <ul className={styles.list}>
                {SELLER_ONBOARDING_ITEMS.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link
                  href={href}
                  className={styles.item}
                  aria-current={activeHref === (href.split('?')[0] || href) ? 'page' : undefined}
                  onClick={onClose}
                >
                      <span className={styles.itemIcon}>
                        <Icon size={20} />
                      </span>
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Admin */}
          {isAdmin && (
            <>
              <div className={styles.divider} />
              <div className={styles.sectionLabel}>
                <ShieldCheckIcon size={14} />
                <span>الإدارة</span>
              </div>
              <ul className={styles.list}>
                {ADMIN_ITEMS.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link
                  href={href}
                  className={styles.item}
                  aria-current={activeHref === (href.split('?')[0] || href) ? 'page' : undefined}
                  onClick={onClose}
                >
                      <span className={styles.itemIcon}>
                        <Icon size={20} />
                      </span>
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Bottom */}
          <div className={styles.divider} />
          <ul className={styles.list}>
            {BOTTOM_ITEMS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={styles.item}
                  aria-current={activeHref === (href.split('?')[0] || href) ? 'page' : undefined}
                  onClick={onClose}
                >
                  <span className={styles.itemIcon}>
                    <Icon size={20} />
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            ))}

            <li>
              <button type="button" className={styles.item} onClick={handleInstall}>
                <span className={styles.itemIcon}>
                  <InstallIcon size={20} />
                </span>
                <span>ثبّت التطبيق</span>
              </button>
            </li>

            <li><GlobalShareAction className={styles.item} label="شارك المنصة + QR" /></li>
          </ul>

          {/* Legal */}
          <div className={styles.divider} />
          <ul className={styles.list}>
            {LEGAL_ITEMS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={styles.item}
                  aria-current={activeHref === (href.split('?')[0] || href) ? 'page' : undefined}
                  onClick={onClose}
                >
                  <span className={styles.itemIcon}>
                    <Icon size={20} />
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {contactLinks.enabled && (
            <>
              <div className={styles.divider} />
              <ul className={styles.list} aria-label="قنوات التواصل الرسمية">
                {contactLinks.facebookUrl && (
                  <li>
                    <a href={contactLinks.facebookUrl} target="_blank" rel="noopener noreferrer" className={styles.item}>
                      <span className={styles.itemIcon}><FacebookIcon size={20} /></span>
                      <span>فيسبوك</span>
                      <span className={styles.externalIcon}><ExternalLinkIcon size={14} /></span>
                    </a>
                  </li>
                )}
                {contactLinks.whatsappChannelUrl && (
                  <li>
                    <a href={contactLinks.whatsappChannelUrl} target="_blank" rel="noopener noreferrer" className={styles.item}>
                      <span className={styles.itemIcon}><WhatsAppIcon size={20} /></span>
                      <span>قناة واتساب</span>
                      <span className={styles.externalIcon}><ExternalLinkIcon size={14} /></span>
                    </a>
                  </li>
                )}
                {contactLinks.supportWhatsappUrl && (
                  <li>
                    <a href={contactLinks.supportWhatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.item}>
                      <span className={styles.itemIcon}><WhatsAppIcon size={20} /></span>
                      <span>تواصل مع الدعم</span>
                      <span className={styles.externalIcon}><ExternalLinkIcon size={14} /></span>
                    </a>
                  </li>
                )}
                {contactLinks.email && (
                  <li>
                    <a href={`mailto:${contactLinks.email}`} className={styles.item}>
                      <span className={styles.itemIcon}><FileTextIcon size={20} /></span>
                      <span>إيميل الدعم</span>
                    </a>
                  </li>
                )}
              </ul>
            </>
          )}

          {/* Login/Logout */}
          {isLoggedIn ? (
            <>
              <div className={styles.divider} />
              <ul className={styles.list}>
                <li>
                  <button
                    type="button"
                    className={`${styles.item} ${styles.logout}`}
                    onClick={handleLogout}
                  >
                    <span className={styles.itemIcon}>
                      <LogoutIcon size={20} />
                    </span>
                    <span>خروج</span>
                  </button>
                </li>
              </ul>
            </>
          ) : (
            <>
              <div className={styles.divider} />
              <Link href="/auth" className={styles.loginCta} onClick={onClose}>
                ادخل بسرعة
              </Link>
            </>
          )}

          <footer className={styles.footer}>
            <p className={styles.footerLine}>
              صنع بـ <span className={styles.heart}>♥</span> في شبين القناطر
            </p>
            <p className={styles.footerLine}>فلسطين في القلب 🇵🇸</p>
            <p className={styles.footerVersion}>{appVersion}</p>
          </footer>
        </nav>
      </aside>
    </>
  )
}
