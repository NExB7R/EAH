'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function SmartHeader() {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    lastY.current = window.scrollY
    const update = () => {
      const y = window.scrollY
      const delta = y - lastY.current
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 96)
        lastY.current = y
      }
      ticking.current = false
    }
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      window.requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="smart-header" data-hidden={hidden}>
      <div className="container smart-header-inner">
        <Link className="brand" href="/" aria-label="EAH الرئيسية">
          <span className="brand-mark">E</span>
          <span className="brand-word">EAH<span className="brand-bang">!</span></span>
        </Link>
        <nav className="header-links" aria-label="روابط معلوماتية">
          <a href="#about">عن EAH</a>
          <a href="#contact">تواصل معنا</a>
          <a href="#terms">الشروط</a>
          <a href="#privacy">الخصوصية</a>
        </nav>
      </div>
    </header>
  )
}
