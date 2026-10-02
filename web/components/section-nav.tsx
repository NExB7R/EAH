'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { NAV_ITEMS } from '@/lib/nav-items'
import styles from './section-nav.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Section Nav (Desktop: tooltip | Mobile: label)
// يظهر تحت الهيرو — سكرول أفقي على الموبايل
// ═══════════════════════════════════════════════════════════

type Props = { activeKey?: string }

export default function SectionNav({ activeKey }: Props) {
  const navRef = useRef<HTMLElement>(null)
  const activeRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = activeRef.current
    const nav = navRef.current
    if (!el || !nav) return
    // scroll active into center of nav (بدون animation دائمة)
    const target = el.offsetLeft - nav.clientWidth / 2 + el.clientWidth / 2
    nav.scrollTo({ left: target, behavior: 'smooth' })
  }, [activeKey])

  return (
    <nav ref={navRef} className={styles.nav} aria-label="التنقل بين الأقسام">
      {NAV_ITEMS.map(({ key, href, label, hint, Icon, enabled }) => {
        const active = key === activeKey
        const ref = active ? activeRef : undefined

        if (!enabled) {
          return (
            <span key={key} className={`${styles.item} ${styles.disabled}`} aria-disabled="true">
              <Icon size={20} className={styles.icon} />
              <span className={styles.mobileLabel}>{label}</span>
              <span className={styles.tip}>{label} — قريباً</span>
            </span>
          )
        }

        return (
          <Link
            key={key}
            ref={ref}
            href={href}
            className={`${styles.item} ${active ? styles.active : ''}`}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
          >
            <Icon size={20} className={styles.icon} />
            <span className={styles.mobileLabel}>{label}</span>
            <span className={styles.tip}>{hint}</span>
          </Link>
        )
      })}
    </nav>
  )
}
