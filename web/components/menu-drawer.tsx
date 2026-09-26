'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  CompassIcon,
  StarIcon,
  TagIcon,
  TrendingUpIcon,
  SparklesIcon,
  BellIcon,
  UserIcon,
  SettingsIcon,
  InfoIcon,
  ShareIcon,
  InstallIcon,
  LogoutIcon,
  CloseIcon,
  BadgeCheckIcon,
  ArrowLeftIcon,
} from './icons'
import Avatar from './avatar'
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
  { href: '/featured', label: 'المميز', Icon: StarIcon },
  { href: '/offers', label: 'العروض', Icon: TagIcon },
  { href: '/trends', label: 'الترند', Icon: TrendingUpIcon },
  { href: '/new', label: 'الجديد', Icon: SparklesIcon },
]

const USER_ITEMS: MenuItem[] = [
  { href: '/account', label: 'حسابي', Icon: UserIcon },
  { href: '/notifications', label: 'الإشعارات', Icon: BellIcon },
]

const MERCHANT_ITEMS: MenuItem[] = [
  { href: '/merchant', label: 'لوحة التحكم', Icon: SettingsIcon },
]

const BOTTOM_ITEMS: MenuItem[] = [
  { href: '/about', label: 'مين إحنا', Icon: InfoIcon },
]

export default function MenuDrawer({ open, onClose, session }: Props) {
  const pathname = usePathname()

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

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
  const isMerchant = session?.role === 'merchant' || session?.role === 'admin' || session?.role === 'super_admin'

  const handleShare = async () => {
    if (typeof navigator === 'undefined' || !navigator.share) return
    try {
      await navigator.share({
        title: 'EAH — اللي نفسك فيه ؟',
        url: window.location.origin,
      })
    } catch {
      // المستخدم قفل
    }
  }

  const handleInstall = () => {
    window.dispatchEvent(new CustomEvent('eah:install-request'))
    onClose()
  }

  const handleLogout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST' })
      window.location.href = '/'
    } catch {
      // نتجاهل
    }
  }

  if (!open) return null

  return (
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden
      />

      <aside className={styles.drawer} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>القائمة</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="إغلاق"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {session && (
          <Link
            href="/account"
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
              <div className={styles.profileStats}>
                <span>مصداقية {session.trustScore}</span>
                <span className={styles.dot} aria-hidden>·</span>
                <span>0 نقطة</span>
                <span className={styles.dot} aria-hidden>·</span>
                <span>Bronze</span>
              </div>
            </div>
            <span className={styles.chevron} aria-hidden>
              <ArrowLeftIcon size={18} />
            </span>
          </Link>
        )}

        <nav className={styles.nav}>
          <ul className={styles.list}>
            {PUBLIC_ITEMS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link href={href} className={styles.item}>
                  <span className={styles.itemIcon}><Icon size={20} /></span>
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {isLoggedIn && (
            <>
              <div className={styles.divider} />
              <ul className={styles.list}>
                {USER_ITEMS.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link href={href} className={styles.item}>
                      <span className={styles.itemIcon}><Icon size={20} /></span>
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {isMerchant && (
            <>
              <div className={styles.divider} />
              <ul className={styles.list}>
                {MERCHANT_ITEMS.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link href={href} className={styles.item}>
                      <span className={styles.itemIcon}><Icon size={20} /></span>
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className={styles.divider} />

          <ul className={styles.list}>
            {BOTTOM_ITEMS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link href={href} className={styles.item}>
                  <span className={styles.itemIcon}><Icon size={20} /></span>
                  <span>{label}</span>
                </Link>
              </li>
            ))}

            <li>
              <button type="button" className={styles.item} onClick={handleInstall}>
                <span className={styles.itemIcon}><InstallIcon size={20} /></span>
                <span>ثبّت التطبيق</span>
              </button>
            </li>

            <li>
              <button type="button" className={styles.item} onClick={handleShare}>
                <span className={styles.itemIcon}><ShareIcon size={20} /></span>
                <span>شارك المنصة</span>
              </button>
            </li>
          </ul>

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
                    <span className={styles.itemIcon}><LogoutIcon size={20} /></span>
                    <span>خروج</span>
                  </button>
                </li>
              </ul>
            </>
          ) : (
            <>
              <div className={styles.divider} />
              <Link href="/auth" className={styles.loginCta}>
                ادخل بسرعة
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  )
}
