'use client'

import { useEffect, useRef, useState } from 'react'
import { useMounted } from '@/lib/hooks/use-mounted'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './logo'
import Avatar from './avatar'
import MenuDrawer from './menu-drawer'
import HeaderWeather from './header-weather'
import ThemeSwitcher from './theme-switcher'
import { BellIcon, MenuIcon, InstallIcon, LockIcon } from './icons'
import type { UserSession } from '@/lib/data/user'
import styles from './floating-capsule.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Floating Capsule
// يمين: [☰] [⬇️] [🎯] [ℹ️]  |  نص: [👑 EAH]  |  شمال: [🔔] [👤]
// ═══════════════════════════════════════════════════════════

type Props = {
  session: UserSession | null
}

export default function FloatingCapsule({ session }: Props) {
  const mounted = useMounted()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
      setScrolled(y > 80)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const prevPathRef = useRef(pathname)
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname
      const t = setTimeout(() => setDrawerOpen(false), 250)
      return () => clearTimeout(t)
    }
  }, [pathname])

  const handleInstall = () => {
    window.dispatchEvent(new CustomEvent('eah:show-install'))
  }

  const isLoggedIn = !!session

  if (!mounted) return null

  return (
    <>
      <header
        className={`${styles.capsule} ${scrolled ? styles.scrolled : ''}`}
        data-scrolled={scrolled}
      >
        <div className={styles.inner}>
          {/* ─── يمين: الأدوات ─── */}
          <div className={styles.right}>
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.iconPrimary}`}
              onClick={() => setDrawerOpen(true)}
              aria-label="القائمة"
            >
              <MenuIcon size={20} />
            </button>

            <button
              type="button"
              className={`${styles.iconBtn} ${styles.iconGold} ${styles.installBtn}`}
              onClick={handleInstall}
              aria-label="ثبّت التطبيق"
              data-tooltip="ثبّت التطبيق"
            >
              <InstallIcon size={20} />
            </button>

            <HeaderWeather />
            <ThemeSwitcher />
          </div>

          {/* ─── النص: اللوجو ─── */}
          <div className={styles.center}>
            <Link href="/" aria-label="EAH — الرئيسية">
              <Logo size="xs" variant="compact" href={null} />
            </Link>
          </div>

          {/* ─── شمال: المستخدم ─── */}
          <div className={styles.left}>
            {isLoggedIn ? (
              <>
                <Link href="/notifications" className={styles.iconBtn} aria-label="الإشعارات">
                  <BellIcon size={20} />
                  {session.notifCount > 0 && (
                    <span className={styles.badge}>
                      {session.notifCount > 9 ? '9+' : session.notifCount}
                    </span>
                  )}
                </Link>

                <Link
                  href={
                    session.role === 'admin' || session.role === 'super_admin'
                      ? '/admin'
                      : '/account'
                  }
                  className={styles.avatarLink}
                  aria-label={
                    session.role === 'admin' || session.role === 'super_admin'
                      ? 'لوحة التحكم'
                      : 'حسابي'
                  }
                >
                  <Avatar
                    displayName={session.displayName}
                    avatarUrl={session.avatarUrl}
                    role={session.role}
                    phoneVerified={session.phoneVerified}
                    size="sm"
                  />
                </Link>
              </>
            ) : (
              <Link href="/auth" className={styles.loginBtn} aria-label="ادخل بسرعة">
                <LockIcon size={16} />
                <span>ادخل بسرعة</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <MenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} session={session} />
    </>
  )
}
