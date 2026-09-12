'use client'
import { useState, useEffect } from 'react'
import EahLogo from './eah-logo'
import NeonIconButton from './neon-icon-button'
import ShareButton from './share-button'
import UserAvatar from './user-avatar'
import {
  IconKey, IconFacebook, IconWhatsapp,
  IconMenu, IconInstall, IconStore,
} from './neon-icons'
import './floating-capsule.css'

const MOCK_LOGGED_IN = false
const MOCK_USER = {
  name: 'بندق',
  points: 1450,
  unreadNotifications: 3,
  banUntil: null as string | null,
}

export default function FloatingCapsuleHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [crownActive, setCrownActive] = useState(false)
  const [loggedIn] = useState(MOCK_LOGGED_IN)

  useEffect(() => {
    let lastY = window.scrollY
    let timer: ReturnType<typeof setTimeout> | null = null

    const onScroll = () => {
      const y = window.scrollY
      setIsScrolled(y > 30)
      if (y > lastY + 5) {
        setCrownActive(true)
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => setCrownActive(false), 1400)
      }
      lastY = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (timer) clearTimeout(timer)
    }
  }, [])

  const handleLogoClick = () => {
    setCrownActive(true)
    setTimeout(() => setCrownActive(false), 1400)
  }

  return (
    <header className={`floating-capsule ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="floating-capsule__inner">

        {/* RTL start (يمين): القائمة، ثبّت، سجل، دخول */}
        <div className="floating-capsule__side floating-capsule__side--start">
          <NeonIconButton icon={<IconMenu />} label="القائمة" ariaLabel="القائمة" />
          <NeonIconButton icon={<IconInstall />} label="ثبّت" ariaLabel="تثبيت المنصة" />
          <NeonIconButton icon={<IconStore />} label="سجل" ariaLabel="تسجيل حساب" />
          {!loggedIn && (
            <NeonIconButton
              icon={<IconKey />}
              label="دخول"
              ariaLabel="تسجيل الدخول"
              href="/auth"
            />
          )}
        </div>

        {/* Center: اللوجو */}
        <div className="floating-capsule__center" onClick={handleLogoClick}>
          <EahLogo size="md" variant="compact" active={crownActive} />
        </div>

        {/* RTL end (شمال): مشاركة، فيسبوك، واتساب */}
        <div className="floating-capsule__side floating-capsule__side--end">
          <ShareButton />
          <NeonIconButton icon={<IconFacebook />} label="فيسبوك" href="#" ariaLabel="فيسبوك" />
          <NeonIconButton icon={<IconWhatsapp />} label="واتساب" href="#" ariaLabel="واتساب" />
          {loggedIn && (
            <UserAvatar
              name={MOCK_USER.name}
              points={MOCK_USER.points}
              unreadNotifications={MOCK_USER.unreadNotifications}
              banUntil={MOCK_USER.banUntil}
            />
          )}
        </div>

      </div>
    </header>
  )
}
