'use client'
import { useState, useEffect } from 'react'
import EahLogo from './eah-logo'
import NeonIconButton from './neon-icon-button'
import {
  IconSearch, IconKey, IconBolt, IconFacebook, IconWhatsapp,
  IconMenu, IconInstall, IconStore,
} from './neon-icons'
import './floating-capsule.css'

export default function FloatingCapsuleHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [crownTrigger, setCrownTrigger] = useState(0)

  useEffect(() => {
    let lastY = window.scrollY
    let scrollTimer: ReturnType<typeof setTimeout> | null = null

    const onScroll = () => {
      const y = window.scrollY
      setIsScrolled(y > 30)

      // لما المستخدم ينزل (scroll down) نشغّل حركة التاج
      if (y > lastY + 5) {
        setCrownTrigger((n) => n + 1)
      }
      lastY = y

      // نرجع التاج لمكانه بعد 1.2 ثانية من آخر سكرول
      if (scrollTimer) clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        setCrownTrigger(0)
      }, 1200)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleCrownTap = () => {
    setCrownTrigger((n) => n + 1)
    setTimeout(() => setCrownTrigger(0), 1200)
  }

  const crownActive = crownTrigger > 0

  return (
    <header className={`floating-capsule ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="floating-capsule__inner">
        {/* RTL: يمين — قائمة + سوشيال */}
        <div className="floating-capsule__side">
          <NeonIconButton icon={<IconMenu />} label="القائمة" ariaLabel="القائمة" />
          <NeonIconButton icon={<IconWhatsapp />} label="واتساب" href="#" ariaLabel="واتساب" />
          <NeonIconButton icon={<IconFacebook />} label="فيسبوك" href="#" ariaLabel="فيسبوك" />
        </div>

        {/* المنتصف — اللوجو الكامل مع السلوجان */}
        <div
          className={`floating-capsule__center ${crownActive ? 'crown-active' : ''}`}
          onClick={handleCrownTap}
        >
          <EahLogo size="sm" variant="full" />
        </div>

        {/* RTL: شمال — إجراءات */}
        <div className="floating-capsule__side floating-capsule__side--end">
          <NeonIconButton icon={<IconInstall />} label="ثبّت المنصة" ariaLabel="تثبيت المنصة" />
          <NeonIconButton icon={<IconStore />} label="سجّل متجرك" ariaLabel="سجل متجرك" />
          <NeonIconButton icon={<IconSearch />} label="بحث" ariaLabel="بحث" />
          <NeonIconButton icon={<IconKey />} label="دخول" ariaLabel="دخول" />
          <NeonIconButton icon={<IconBolt />} label="سجل بسرعة" variant="accent" ariaLabel="سجل بسرعة" />
        </div>
      </div>
    </header>
  )
}
