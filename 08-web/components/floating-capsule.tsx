'use client'
import { useState, useEffect } from 'react'
import EahLogo from './eah-logo'
import NeonIconButton from './neon-icon-button'
import {
  IconSearch,
  IconKey,
  IconBolt,
  IconFacebook,
  IconWhatsapp,
  IconMenu,
} from './neon-icons'
import './floating-capsule.css'

export default function FloatingCapsuleHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`floating-capsule ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="floating-capsule__inner">
        {/* RTL: بداية (يمين) — سوشيال + قائمة */}
        <div className="floating-capsule__side">
          <NeonIconButton icon={<IconMenu />} label="القائمة" ariaLabel="القائمة" />
          <NeonIconButton icon={<IconWhatsapp />} label="واتساب" href="#" ariaLabel="واتساب" />
          <NeonIconButton icon={<IconFacebook />} label="فيسبوك" href="#" ariaLabel="فيسبوك" />
        </div>

        {/* المنتصف — اللوجو مع السلوجان */}
        <div className="floating-capsule__center">
          <EahLogo size="md" variant="tagline" />
        </div>

        {/* RTL: نهاية (شمال) — تسجيل + دخول + بحث */}
        <div className="floating-capsule__side floating-capsule__side--end">
          <NeonIconButton icon={<IconSearch />} label="بحث" ariaLabel="بحث" />
          <NeonIconButton icon={<IconKey />} label="دخول" ariaLabel="دخول" />
          <NeonIconButton
            icon={<IconBolt />}
            label="سجل بسرعة"
            variant="accent"
            ariaLabel="سجل بسرعة"
          />
        </div>
      </div>
    </header>
  )
}
