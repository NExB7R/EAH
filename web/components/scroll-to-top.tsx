'use client'

import { useEffect, useState } from 'react'
import { ChevronLeftIcon } from './icons'
import styles from './scroll-to-top.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Scroll To Top
//   • يظهر لما المستخدم ينزل 400px
//   • سلس + خفيف (CSS فقط للأنيميشن)
//   • Neon gold + purple glow
// ═══════════════════════════════════════════════════════════

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
      setVisible(y > 400)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label="الرجوع لأعلى"
      className={`${styles.btn} ${visible ? styles.visible : ''}`}
    >
      <ChevronLeftIcon size={22} className={styles.icon} />
      <span className={styles.ring} aria-hidden />
    </button>
  )
}
