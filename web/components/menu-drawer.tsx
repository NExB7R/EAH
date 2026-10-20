'use client'

import { useEffect, useRef, useState } from 'react'
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
  ShareIcon,
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
  LocationIcon,
  StoreIcon,
  GiftIcon,
  HelpCircleIcon,
} from './icons'
import Avatar from './avatar'
import Logo from './logo'
import type { UserSession } from '@/lib/data/user'
import styles from './menu-drawer.module.css'

type Props = {
  open: boolean
  onClose: () => void
  session: UserSession | null
}

type MenuItem = {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

// ─── Public (للجميع) ───
const PUBLIC_ITEMS: MenuItem[] = [
  { href: '/', label: 'الرئيسية', Icon: HomeIcon },
  { href: '/explore', label: 'اكتشف', Icon: CompassIcon },
  { href: '/featured', label: 'المميزون', Icon: StarIcon },
  { href: '/trends', label: 'الترند', Icon: TrendingUpIcon },
  { href: '/offers', label: 'العروض', Icon: TagIcon },
  { href: '/new', label: 'بدايات', Icon: SparklesIcon },
  { href: '/nearby', label: 'قريب منك', Icon: LocationIcon },
  { href: '/suggest', label: 'ارشحلك', Icon: TargetIcon },
  { href: '/trust', label: 'المصداقية', Icon: ShieldCheckIcon },
]

// ─── Customer (مسجل) ───
const CUSTOMER_ITEMS: MenuItem[] = [
  { href: '/account', label: 'حسابي', Icon: LayoutDashboardIcon },
  { href: '/account/orders', label: 'طلباتي', Icon: FileTextIcon },
  { href: '/account/favorites', label: 'المفضلات', Icon: StarIcon },
  { href: '/account/following', label: 'المتابعات', Icon: StoreIcon },
  { href: '/account/badges', label: 'الشارات', Icon: SparklesIcon },
  { href: '/account/points', label: 'النقاط', Icon: GiftIcon },
  { href: '/account/referral', label: 'دعوة أصحابك', Icon: ShareIcon },
  { href: '/account/notifications', label: 'الإشعارات', Icon: BellIcon },
]

// ─── Merchant (لو عنده نشاط) ───
const MERCHANT_SECTION: MenuItem[] = [
  { href: '/merchant', label: 'لوحة نشاطي', Icon: LayoutDashboardIcon },
  { href: '/merchant/orders', label: 'الطلبات', Icon: FileTextIcon },
  { href: '/merchant/offers', label: 'العروض', Icon: GiftIcon },
  { href: '/merchant/insights', label: 'المساعد الذكي', Icon: SparklesIcon },
  { href: '/merchant/qr', label: 'QR النشاط', Icon: TargetIcon },
]

// ─── Guest Merchant (مش مسجل نشاط) ───
const MERCHANT_APPLY: MenuItem[] = [
  { href: '/merchant/apply', label: 'سجّل نشاطك', Icon: StoreIcon },
  { href: '/pricing', label: 'الباقات', Icon: GiftIcon },
  { href: '/advertise', label: 'أعلن معانا', Icon: TrendingUpIcon },
]

// ─── Admin ───
const ADMIN_ITEMS: MenuItem[] = [{ href: '/admin', label: 'لوحة الأدمن', Icon: ShieldCheckIcon }]

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

export default function MenuDrawer({ open, onClose, session }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const onCloseRef = useRef(onClose)
  const [shareCopied, setShareCopied] = useState(false)

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
  const isAdmin = session?.role === 'admin' || session?.role === 'super_admin'
  const isMerchant = session?.role === 'merchant'

  const handleShare = async () => {
    const url =
      typeof window !== 'undefined'
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL ?? '')
    const title = 'EAH — اللي نفسك فيه ؟'
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // cancelled — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      window.prompt('انسخ الرابط:', url)
    }
  }

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
              phoneVerified={session.phoneVerified}
              size="lg"
            />
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>
                <span>{session.displayName}</span>
                {session.phoneVerified && (
                  <span className={styles.verifiedIcon}>
                    <BadgeCheckIcon size={14} />
                  </span>
                )}
              </div>
              {!isAdmin && (
                <div className={styles.profileStats}>
                  <span>مصداقية {session.trustScore}</span>
                  <span className={styles.dot}>·</span>
                  <span>{session.trustTier}</span>
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
                <Link href={href} className={styles.item} onClick={onClose}>
                  <span className={styles.itemIcon}>
                    <Icon size={20} />
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Customer — مسجل (مش أدمن) */}
          {isLoggedIn && !isAdmin && (
            <>
              <div className={styles.divider} />
              <div className={styles.sectionLabel}>
                <LayoutDashboardIcon size={14} />
                <span>حسابي</span>
              </div>
              <ul className={styles.list}>
                {CUSTOMER_ITEMS.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link href={href} className={styles.item} onClick={onClose}>
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

          {/* Merchant dashboard — لو عنده نشاط */}
          {isMerchant && (
            <>
              <div className={styles.divider} />
              <div className={styles.sectionLabel}>
                <StoreIcon size={14} />
                <span>نشاطي</span>
              </div>
              <ul className={styles.list}>
                {MERCHANT_SECTION.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link href={href} className={styles.item} onClick={onClose}>
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

          {/* Merchant apply — للمسجل بدون نشاط (مش أدمن) */}
          {isLoggedIn && !isMerchant && !isAdmin && (
            <>
              <div className={styles.divider} />
              <div className={styles.sectionLabel}>
                <StoreIcon size={14} />
                <span>سجّل نشاطك</span>
              </div>
              <ul className={styles.list}>
                {MERCHANT_APPLY.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link href={href} className={styles.item} onClick={onClose}>
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

          {/* Guest — للزوار (بدون تسجيل) */}
          {!isLoggedIn && (
            <>
              <div className={styles.divider} />
              <div className={styles.sectionLabel}>
                <StoreIcon size={14} />
                <span>للتجار</span>
              </div>
              <ul className={styles.list}>
                {MERCHANT_APPLY.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link href={href} className={styles.item} onClick={onClose}>
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
                    <Link href={href} className={styles.item} onClick={onClose}>
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
                <Link href={href} className={styles.item} onClick={onClose}>
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

            <li>
              <button type="button" className={styles.item} onClick={handleShare}>
                <span className={styles.itemIcon}>
                  <ShareIcon size={20} />
                </span>
                <span>{shareCopied ? 'اتنسخ الرابط ✓' : 'شارك المنصة'}</span>
              </button>
            </li>
          </ul>

          {/* Legal */}
          <div className={styles.divider} />
          <ul className={styles.list}>
            {LEGAL_ITEMS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link href={href} className={styles.item} onClick={onClose}>
                  <span className={styles.itemIcon}>
                    <Icon size={20} />
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Social */}
          <div className={styles.divider} />
          <ul className={styles.list}>
            <li>
              <a
                href="https://facebook.com/eah.eg"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.item}
              >
                <span className={styles.itemIcon}>
                  <FacebookIcon size={20} />
                </span>
                <span>فيسبوك</span>
                <span className={styles.externalIcon}>
                  <ExternalLinkIcon size={14} />
                </span>
              </a>
            </li>
            <li>
              <a
                href="https://whatsapp.com/channel/eaH"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.item}
              >
                <span className={styles.itemIcon}>
                  <WhatsAppIcon size={20} />
                </span>
                <span>قناة واتساب</span>
                <span className={styles.externalIcon}>
                  <ExternalLinkIcon size={14} />
                </span>
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/201012892806"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.item}
              >
                <span className={styles.itemIcon}>
                  <WhatsAppIcon size={20} />
                </span>
                <span>كلم المسؤول</span>
                <span className={styles.externalIcon}>
                  <ExternalLinkIcon size={14} />
                </span>
              </a>
            </li>
          </ul>

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
