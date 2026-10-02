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

const PUBLIC_ITEMS: MenuItem[] = [
  { href: '/', label: 'الرئيسية', Icon: HomeIcon },
  { href: '/explore', label: 'اكتشف', Icon: CompassIcon },
  { href: '/featured', label: 'المميزون', Icon: StarIcon },
  { href: '/trends', label: 'الترند', Icon: TrendingUpIcon },
  { href: '/offers', label: 'العروض', Icon: TagIcon },
  { href: '/new', label: 'الجديد', Icon: SparklesIcon },
  { href: '/nearby', label: 'قريب منك', Icon: LocationIcon },
  { href: '/suggest', label: 'رشحلى', Icon: TargetIcon },
  { href: '/updates', label: 'التحديثات', Icon: SparklesIcon },
]

const USER_ITEMS: MenuItem[] = [
  { href: '/account/notifications', label: 'الإشعارات', Icon: BellIcon },
]

const MERCHANT_ITEMS: MenuItem[] = [
  { href: '/merchant/apply', label: 'سجّل نشاطك', Icon: StoreIcon },
  { href: '/pricing', label: 'الباقات', Icon: GiftIcon },
  { href: '/advertise', label: 'أعلن معانا', Icon: TrendingUpIcon },
  { href: '/merchant', label: 'لوحة التحكم', Icon: LayoutDashboardIcon },
]

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

  const handleShare = async () => {
    if (typeof navigator === 'undefined' || !navigator.share) return
    try {
      await navigator.share({
        title: 'EAH — اللي نفسك فيه ؟',
        url: window.location.origin,
      })
    } catch {
      // closed
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
          <Link href="/account" className={styles.profileSection} onClick={onClose}>
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
              <div className={styles.profileStats}>
                <span>مصداقية {session.trustScore}</span>
                <span className={styles.dot}>·</span>
                <span>{session.trustTier}</span>
              </div>
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

          {/* User */}
          {isLoggedIn && (
            <>
              <div className={styles.divider} />
              <ul className={styles.list}>
                {USER_ITEMS.map(({ href, label, Icon }) => (
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

          {/* Merchant section — للكل */}
          <div className={styles.divider} />
          <div className={styles.sectionLabel}>
            <StoreIcon size={14} />
            <span>للتجار</span>
          </div>
          <ul className={styles.list}>
            {MERCHANT_ITEMS.slice(0, 3).map(({ href, label, Icon }) => (
              <li key={href}>
                <Link href={href} className={styles.item} onClick={onClose}>
                  <span className={styles.itemIcon}>
                    <Icon size={20} />
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            ))}
            {isLoggedIn &&
              session?.role === 'merchant' &&
              MERCHANT_ITEMS.slice(3).map(({ href, label, Icon }) => (
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

          {/* Admin */}
          {isAdmin && (
            <>
              <div className={styles.divider} />
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
                <span>شارك المنصة</span>
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
