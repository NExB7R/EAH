'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './logo'
import Avatar from './avatar'
import MenuDrawer from './menu-drawer'
import {
  BellIcon,
  MenuIcon,
  InfoIcon,
  ShareIcon,
  InstallIcon,
  LockIcon,
} from './icons'
import type { UserSession } from '@/lib/data/user'
import styles from './floating-capsule.module.css'

type Props = {
  session: UserSession | null
}

export default function FloatingCapsule({ session }: Props) {
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const handleShare = async () => {
    if (typeof navigator === 'undefined' || !navigator.share) return
    try {
      await navigator.share({
        title: 'EAH — اللي نفسك فيه ؟',
        text: 'اكتشف أحسن الأماكن حواليك',
        url: window.location.origin,
      })
    } catch {
      // المستخدم قفل الـ share — نتجاهل
    }
  }

  const handleInstall = () => {
    // يُطلق حدث مخصص — InstallPrompt يستمع له
    window.dispatchEvent(new CustomEvent('eah:install-request'))
  }

  const isLoggedIn = !!session

  // ⚠️ منع hydration mismatch — متظهرش على الـ server
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
              className={styles.iconBtn}
              onClick={() => setDrawerOpen(true)}
              aria-label="القائمة"
            >
              <MenuIcon size={20} />
            </button>

            <Link href="/about" className={styles.iconBtn} aria-label="مين إحنا">
              <InfoIcon size={20} />
            </Link>

            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleShare}
              aria-label="مشاركة"
            >
              <ShareIcon size={20} />
            </button>

            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleInstall}
              aria-label="تثبيت التطبيق"
            >
              <InstallIcon size={20} />
            </button>
          </div>

          {/* ─── النص: اللوجو ─── */}
          <div className={styles.center}>
            <Link href="/" aria-label="EAH — الرئيسية">
              <Logo size="sm" variant="full" href={undefined} />
            </Link>
          </div>

          {/* ─── شمال: المستخدم ─── */}
          <div className={styles.left}>
            {isLoggedIn ? (
              <>
                <Link
                  href="/notifications"
                  className={styles.iconBtn}
                  aria-label="الإشعارات"
                >
                  <BellIcon size={20} />
                  {session.notifCount > 0 && (
                    <span className={styles.badge}>
                      {session.notifCount > 9 ? '9+' : session.notifCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/account"
                  className={styles.avatarLink}
                  aria-label="حسابي"
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
              <Link href="/auth" className={styles.loginBtn}>
                <LockIcon size={16} />
                <span>ادخل بسرعة</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <MenuDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        session={session}
      />
    </>
  )
}
