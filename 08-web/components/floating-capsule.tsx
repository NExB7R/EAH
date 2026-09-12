'use client'
import { useState, useEffect } from 'react'
import EahLogo from './eah-logo'
import NeonIconButton from './neon-icon-button'
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
        {/* جهة اليمين (RTL): التواصل و القائمة */}
        <div className="floating-capsule__side">
          <NeonIconButton icon="📘" label="فيسبوك" href="#" />
          <NeonIconButton icon="💬" label="واتساب" href="#" />
          <NeonIconButton icon="☰" label="القائمة" />
        </div>

        {/* المنتصف: اللوجو */}
        <div className="floating-capsule__center">
          <EahLogo size="sm" variant="mark" />
        </div>

        {/* جهة اليسار (RTL): التسجيل و البحث */}
        <div className="floating-capsule__side floating-capsule__side--end">
          <NeonIconButton icon="🔍" label="بحث" />
          <NeonIconButton icon="🔑" label="دخول" />
          <NeonIconButton icon="⚡" label="سجل بسرعة" variant="accent" />
        </div>
      </div>
    </header>
  )
}
