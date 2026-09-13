'use client'
import { useState, useEffect } from 'react'
import EahLogo from './eah-logo'
import NeonIconButton from './neon-icon-button'
import ShareButton from './share-button'
import UserAvatar from './user-avatar'
import OverlayBlur from './overlay-blur'
import {
  IconKey, IconFacebook, IconWhatsapp,
  IconMenu, IconInstall, IconBolt,
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
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [menuOpen, setMenuOpen] = useState(false)
  const [crownActive, setCrownActive] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let crownTimer: ReturnType<typeof setTimeout> | null = null

    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      setDirection(y > lastY ? 'down' : 'up')

      // لما المستخدم ينزل، شغّل حركة التاج
      if (y > lastY + 5) {
        setCrownActive(true)
        if (crownTimer) clearTimeout(crownTimer)
        crownTimer = setTimeout(() => setCrownActive(false), 1400)
      }
      lastY = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (crownTimer) clearTimeout(crownTimer)
    }
  }, [])

  const handleLogoClick = () => {
    setCrownActive(true)
    setTimeout(() => setCrownActive(false), 1400)
  }

  return (
    <>
      <header className={`floating-capsule ${scrolled ? 'is-scrolled' : ''} ${direction === 'up' ? 'is-up' : 'is-down'}`}>
        <div className="floating-capsule__inner">
          <div className="floating-capsule__side floating-capsule__side--start">
            <NeonIconButton icon={<IconMenu />} label="القائمة" ariaLabel="القائمة" onClick={() => setMenuOpen(true)} />
            <NeonIconButton icon={<IconInstall />} label="ثبّت" ariaLabel="تثبيت" />
            <NeonIconButton icon={<IconKey />} label="دخول" ariaLabel="دخول" href="/auth" />
            <NeonIconButton icon={<IconBolt />} label="سجل بسرعة" ariaLabel="سجل بسرعة" variant="accent" href="/auth?tab=register" />
          </div>

          {/* اللوجو دايماً ظاهر — بـ compact (word + crown متحرك) */}
          <div className="floating-capsule__center" onClick={handleLogoClick}>
            <EahLogo size="sm" variant="compact" active={crownActive} />
          </div>

          <div className="floating-capsule__side floating-capsule__side--end">
            <ShareButton />
            <NeonIconButton icon={<IconFacebook />} label="فيسبوك" href="#" ariaLabel="فيسبوك" />
            <NeonIconButton icon={<IconWhatsapp />} label="واتساب" href="#" ariaLabel="واتساب" />
            {MOCK_LOGGED_IN && <UserAvatar name="بندق" points={1450} unreadNotifications={3} />}
          </div>
        </div>
      </header>

      <OverlayBlur open={menuOpen} />

      <div className={`nav-drawer ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} aria-hidden={!menuOpen}>
        <div className="nav-drawer__panel" onClick={(e) => e.stopPropagation()}>
          <div className="nav-drawer__head">
            <EahLogo size="sm" variant="compact" />
            <button type="button" className="nav-drawer__close" onClick={() => setMenuOpen(false)} aria-label="إغلاق">×</button>
          </div>
          <nav className="nav-drawer__nav">
            {MENU_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="nav-drawer__link">{link.label}</a>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
