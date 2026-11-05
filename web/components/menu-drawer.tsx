'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  HomeIcon,
  CompassIcon,
  StarIcon,
  TagIcon,
  TrendingUpIcon,
  SparklesIcon,
  BellIcon,
  BroadcastIcon,
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
  UserIcon,
  LockIcon,
  ShareIcon,
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

// ─── روابط الحساب المشتركة (العميل والتاجر) ───
const ACCOUNT_ITEMS: MenuItem[] = [
  { href: '/account', label: 'نظرة عامة', Icon: LayoutDashboardIcon },
  { href: '/account/edit', label: 'بياناتي الشخصية', Icon: UserIcon },
  { href: '/account/security', label: 'الأمان', Icon: LockIcon },
  { href: '/account/verify', label: 'التوثيق', Icon: ShieldCheckIcon },
  { href: '/account/orders', label: 'الطلبات', Icon: FileTextIcon },
  { href: '/account/favorites', label: 'المفضلات', Icon: StarIcon },
  { href: '/account/following', label: 'المتابعات', Icon: StoreIcon },
  { href: '/account/notifications', label: 'الإشعارات', Icon: BellIcon },
  { href: '/account/points', label: 'النقاط', Icon: GiftIcon },
  { href: '/account/loyalty', label: 'الولاء', Icon: CrownGoldIcon },
  { href: '/account/badges', label: 'الشارات', Icon: SparklesIcon },
  { href: '/account/referral', label: 'دعوة أصدقاء', Icon: ShareIcon },
]

// ─── مساحة عمل التاجر: تطابق الروابط قائمة MerchantSidebar ───
const SELLER_SECTION: MenuItem[] = [
  { href: '/merchant', label: 'نظرة عامة', Icon: LayoutDashboardIcon },
  { href: '/merchant/business', label: 'بيانات النشاط', Icon: StoreIcon },
  { href: '/merchant/branches', label: 'الفروع', Icon: MapPinIcon },
  { href: '/merchant/orders', label: 'الطلبات', Icon: FileTextIcon },
  { href: '/merchant/orders/settings', label: 'إعدادات الطلبات', Icon: SettingsIcon },
  { href: '/merchant/offers', label: 'العروض', Icon: GiftIcon },
  { href: '/merchant/ads', label: 'الإعلانات', Icon: TagIcon },
  { href: '/merchant/qr', label: 'رمز الاستجابة السريعة للنشاط', Icon: QrCodeIcon },
  { href: '/merchant/insights', label: 'المساعد الذكي', Icon: SparklesIcon },
  { href: '/merchant/trust', label: 'سمعة النشاط', Icon: ShieldCheckIcon },
  { href: '/merchant/subscription', label: 'الباقة والاشتراك', Icon: CrownGoldIcon },
  { href: '/merchant/settings', label: 'إعدادات النشاط', Icon: SettingsIcon },
  { href: '/account/notifications', label: 'الإشعارات', Icon: BellIcon },
]

// ─── بداية التاجر (للزائر أو العميل الذي ليس لديه نشاط) ───
const SELLER_ONBOARDING_ITEMS: MenuItem[] = [
  { href: '/merchant/apply', label: 'سجّل نشاطك', Icon: StoreIcon },
  { href: '/pricing', label: 'الباقات', Icon: GiftIcon },
  { href: '/advertise', label: 'أعلن معانا', Icon: TrendingUpIcon },
]

// ─── Admin ───
const ADMIN_ITEMS: MenuItem[] = [
  { href: '/admin', label: 'لوحة التحكم', Icon: LayoutDashboardIcon },
  { href: '/admin/analytics', label: 'التحليلات', Icon: TrendingUpIcon },
  { href: '/admin/health', label: 'صحة النظام', Icon: ShieldCheckIcon },
  { href: '/admin/studio', label: 'الاستوديو', Icon: SparklesIcon },
  { href: '/admin/businesses', label: 'كل الأنشطة', Icon: StoreIcon },
  { href: '/admin/businesses/new', label: 'إضافة نشاط', Icon: StoreIcon },
  { href: '/admin/featured', label: 'الأنشطة المميزة', Icon: CrownGoldIcon },
  { href: '/admin/business-types', label: 'أنواع الأنشطة', Icon: SparklesIcon },
  { href: '/admin/insights', label: 'تقارير الأنشطة', Icon: FileTextIcon },
  { href: '/admin/users', label: 'المستخدمون', Icon: UserIcon },
  { href: '/admin/subscriptions', label: 'الاشتراكات', Icon: CrownGoldIcon },
  { href: '/admin/ads', label: 'الإعلانات', Icon: TagIcon },
  { href: '/admin/moderation', label: 'التقييمات', Icon: ShieldCheckIcon },
  { href: '/admin/moderation?tab=reports', label: 'البلاغات', Icon: FileTextIcon },
  { href: '/admin/moderation?tab=fraud', label: 'كشف الاحتيال', Icon: ShieldIcon },
  { href: '/admin/notifications', label: 'الإشعارات والرسائل', Icon: BellIcon },
  { href: '/admin/notifications?tab=announcements', label: 'الإعلانات العامة', Icon: BroadcastIcon },
  { href: '/admin/profile', label: 'بروفايلي', Icon: UserIcon },
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

function getActiveMenuHref(
  pathname: string,
  searchParams: { get: (key: string) => string | null; has: (key: string) => boolean },
): string | null {
  const matching = ALL_MENU_ITEMS.filter(({ href }) => {
    const [baseHref = href, queryString] = href.split('?')
    const pathMatches =
      baseHref === '/' ? pathname === '/' : pathname === baseHref || pathname.startsWith(`${baseHref}/`)
    if (!pathMatches) return false

    if (queryString) {
      const expected = new URLSearchParams(queryString)
      return [...expected.entries()].every(([key, value]) => searchParams.get(key) === value)
    }

    // The default moderation/notifications pages represent the unfiltered first tab.
    if (baseHref === '/admin/moderation' || baseHref === '/admin/notifications') {
      return !searchParams.has('tab')
    }

    return true
  }).sort((a, b) => {
    const aPath = a.href.split('?')[0] ?? a.href
    const bPath = b.href.split('?')[0] ?? b.href
    return bPath.length - aPath.length || Number(b.href.includes('?')) - Number(a.href.includes('?'))
  })

  return matching[0]?.href ?? null
}

export default function MenuDrawer({ open, onClose, session, contactLinks }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeHref = getActiveMenuHref(pathname, searchParams)
  const router = useRouter()

  const drawerRef = useRef<HTMLElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    onCloseRef.current()
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement && document.activeElement !== document.body
        ? document.activeElement
        : null
    const drawer = drawerRef.current
    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const getFocusableElements = () =>
      Array.from(drawer?.querySelectorAll<HTMLElement>(focusableSelector) ?? []).filter(
        (element) => element.getAttribute('aria-disabled') !== 'true',
      )

    getFocusableElements()[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) {
        event.preventDefault()
        drawer?.focus()
        return
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousBodyOverflow
      previouslyFocusedElement?.focus()
    }
  }, [open])

  const isLoggedIn = !!session
  const isAdmin = session?.role === 'super_admin'
  const isSeller = session?.role === 'merchant'
  const hasSellerWorkspace = isSeller && session?.hasBusiness === true
  const canStartSellerOnboarding =
    isLoggedIn && !isAdmin && !hasSellerWorkspace && !session?.hasBusiness

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

      <aside ref={drawerRef} className={styles.drawer} role="dialog" aria-modal="true" aria-label="القائمة الرئيسية" tabIndex={-1}>
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
                  aria-current={activeHref === href ? 'page' : undefined}
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
                  aria-current={activeHref === href ? 'page' : undefined}
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

          {/* مساحة عمل التاجر المرتبط بنشاط */}
          {hasSellerWorkspace && (
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
                  aria-current={activeHref === href ? 'page' : undefined}
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
          {canStartSellerOnboarding && (
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
                  aria-current={activeHref === href ? 'page' : undefined}
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
                  aria-current={activeHref === href ? 'page' : undefined}
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
                  aria-current={activeHref === href ? 'page' : undefined}
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
                  aria-current={activeHref === href ? 'page' : undefined}
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

            <li><GlobalShareAction className={styles.item} label="شارك المنصة ورمزها السريع" /></li>
          </ul>

          {/* Legal */}
          <div className={styles.divider} />
          <ul className={styles.list}>
            {LEGAL_ITEMS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={styles.item}
                  aria-current={activeHref === href ? 'page' : undefined}
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

          <>
            <div className={styles.divider} />
            <ul className={styles.list} aria-label="قنوات التواصل الرسمية">
              {[
                { key: 'facebook', label: 'فيسبوك', href: contactLinks.facebookUrl, Icon: FacebookIcon, external: true },
                { key: 'whatsapp-channel', label: 'قناة واتساب', href: contactLinks.whatsappChannelUrl, Icon: WhatsAppIcon, external: true },
                { key: 'support-whatsapp', label: 'تواصل مع الدعم', href: contactLinks.supportWhatsappUrl, Icon: WhatsAppIcon, external: true },
                { key: 'support-email', label: 'إيميل الدعم', href: contactLinks.email ? `mailto:${contactLinks.email}` : null, Icon: FileTextIcon, external: false },
              ].map(({ key, label, href, Icon, external }) => (
                <li key={key}>
                  {href ? (
                    <a
                      href={href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      className={styles.item}
                    >
                      <span className={styles.itemIcon}><Icon size={20} /></span>
                      <span>{label}</span>
                      {external && <span className={styles.externalIcon}><ExternalLinkIcon size={14} /></span>}
                    </a>
                  ) : (
                    <div className={`${styles.item} ${styles.itemDisabled}`} aria-disabled="true">
                      <span className={styles.itemIcon}><Icon size={20} /></span>
                      <span>{label}</span>
                      <span className={styles.availabilityHint}>قريبًا</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>

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
