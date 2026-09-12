'use client'

import { useState, useEffect } from 'react'
import EahLogo from './eah-logo'
import './smart-header.css'

export default function SmartHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`smart-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="smart-header__inner">
        {/* Left side (in RTL): Auth & Search */}
        <div className="smart-header__side smart-header__side--start">
          <button className="neo-pill neo-pill--ghost" aria-label="بحث">
            <span className="neo-pill__icon">🔍</span>
            <span className="neo-pill__label">ابحث</span>
          </button>
          <button className="neo-pill neo-pill--ghost" aria-label="دخول سريع">
            <span className="neo-pill__icon">🔑</span>
            <span className="neo-pill__label">دخول</span>
          </button>
          <button className="neo-pill neo-pill--accent" aria-label="سجل بسرعة">
            <span className="neo-pill__icon">⚡</span>
            <span className="neo-pill__label">سجل بسرعة</span>
          </button>
        </div>

        {/* Center: Logo */}
        <div className="smart-header__center">
          <EahLogo size="sm" variant="mark" />
        </div>

        {/* Right side (in RTL): Social & Menu */}
        <div className="smart-header__side smart-header__side--end">
          <a href="#" className="neo-pill neo-pill--icon" aria-label="فيسبوك">
            <span className="neo-pill__icon">📘</span>
          </a>
          <a href="#" className="neo-pill neo-pill--icon" aria-label="واتساب">
            <span className="neo-pill__icon">💬</span>
          </a>
          <button className="neo-pill neo-pill--ghost" aria-label="القائمة">
            <span className="neo-pill__icon">☰</span>
          </button>
        </div>
      </div>
    </header>
  )
}
