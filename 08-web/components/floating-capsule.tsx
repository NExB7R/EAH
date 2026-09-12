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
  const [crownActive, setCrownActive] = useState(false)

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

        {/* ===== يمين (start in RTL): قائمة + ثبّت + سجل + دخول ===== */}
        <div className="floating-capsule__side">
          <NeonIconButton icon={<IconMenu />} label="القائمة" ariaLabel="القائمة" />
          <NeonIconButton icon={<IconInstall />} label="ثبّت المنصة" ariaLabel="تثبيت المنصة" />
          <NeonIconButton icon={<IconStore />} label="سجل" ariaLabel="تسجيل حساب جديد" />
          <NeonIconButton icon={<IconKey />} label="دخول" ariaLabel="تسجيل الدخول" />
        </div>

        {/* ===== المنتصف: اللوجو ===== */}
        <div className="floating-capsule__center" onClick={handleLogoClick}>
          <EahLogo size="sm" variant="full" active={crownActive} />
        </div>

        {/* ===== شمال (end in RTL): بحث + فيسبوك + واتساب ===== */}
        <div className="floating-capsule__side floating-capsule__side--end">
          <NeonIconButton icon={<IconSearch />} label="ابحث" ariaLabel="بحث" />
          <NeonIconButton icon={<IconFacebook />} label="فيسبوك" href="#" ariaLabel="فيسبوك" />
          <NeonIconButton icon={<IconWhatsapp />} label="واتساب" href="#" ariaLabel="واتساب" />
        </div>

      </div>
    </header>
  )
}
