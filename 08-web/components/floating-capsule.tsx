'use client'
import { useState, useEffect } from 'react'
import EahLogo from './eah-logo'
import NeonIconButton from './neon-icon-button'
import ShareButton from './share-button'
import UserAvatar from './user-avatar'
import OverlayBlur from './overlay-blur'
import {
  IconKey, IconFacebook, IconWhatsapp,
  IconMenu, IconInstall, IconBolt, IconSearch,
} from './neon-icons'
import './floating-capsule.css'

const MOCK_LOGGED_IN = false

const MENU_LINKS = [
  { href: '/explore', label: 'اكتشف' },
  { href: '/offers', label: 'العروض' },
  { href: '/recommend', label: 'نفسك في ايه؟' },
  { href: '/trends', label: 'الترندات' },
  { href: '/merchant/apply', label: 'سجّل متجرك' },
  { href: '/about', label: 'نبذة عننا' },
  { href: '/contact', label: 'تواصل معنا' },
  { href: '/advertise', label: 'أعلن معنا' },
  { href: '/terms', label: 'الشروط والأحكام' },
  { href: '/privacy', label: 'سياسة الخصوصية' },
]

export default function FloatingCapsuleHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={`floating-capsule ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="floating-capsule__inner">

          {/* RTL start (يمين) */}
          <div className="floating-capsule__side floating-capsule__side--start">
            <NeonIconButton
              icon={<IconMenu />}
              label="القائمة"
              ariaLabel="القائمة"
              onClick={() => setMenuOpen(true)}
            />
            <NeonIconButton
              icon={<IconSearch />}
              label="اكتشف"
              ariaLabel="اكتشف"
              href="/explore"
            />
            <NeonIconButton icon={<IconInstall />} label="ثبّت" ariaLabel="تثبيت" />
            <NeonIconButton
              icon={<IconKey />}
              label="دخول"
              ariaLabel="دخول"
              href="/auth"
            />
            <NeonIconButton
              icon={<IconBolt />}
              label="سجل بسرعة"
              ariaLabel="سجل بسرعة"
              variant="accent"
              href="/auth?tab=register"
            />
          </div>

          {/* Center */}
          <div className="floating-capsule__center">
            <EahLogo size="sm" variant="plain" />
          </div>

          {/* RTL end (شمال) */}
          <div className="floating-capsule__side floating-capsule__side--end">
            <ShareButton />
            <NeonIconButton icon={<IconFacebook />} label="فيسبوك" href="#" ariaLabel="فيسبوك" />
            <NeonIconButton icon={<IconWhatsapp />} label="واتساب" href="#" ariaLabel="واتساب" />
            {MOCK_LOGGED_IN && (
              <UserAvatar name="بندق" points={1450} unreadNotifications={3} />
            )}
          </div>

        </div>
      </header>

      <OverlayBlur open={menuOpen} />

      <div
        className={`nav-drawer ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      >
        <div className="nav-drawer__panel" onClick={(e) => e.stopPropagation()}>
          <div className="nav-drawer__head">
            <EahLogo size="sm" variant="plain" />
            <button
              type="button"
              className="nav-drawer__close"
              onClick={() => setMenuOpen(false)}
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>
          <nav className="nav-drawer__nav">
            {MENU_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="nav-drawer__link">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
