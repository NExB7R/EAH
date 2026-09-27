'use client'

import Link from 'next/link'
import { useState } from 'react'
import styles from './palestine-heart.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Palestine Heart (neon gold heart with animated flag)
// ═══════════════════════════════════════════════════════════

export default function PalestineHeart() {
  const [active, setActive] = useState(false)

  return (
    <Link
      href="/support-palestine"
      className={`${styles.wrap} ${active ? styles.active : ''}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setActive(false)}
    >
      <div className={styles.heartWrap} aria-hidden>
        <svg
          viewBox="0 0 32 32"
          className={styles.heartSvg}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="heartClip">
              <path d="M16 28.5C16 28.5 3 20 3 11.5C3 6.5 6.5 3 11 3C13.5 3 15.3 4.2 16 5.5C16.7 4.2 18.5 3 21 3C25.5 3 29 6.5 29 11.5C29 20 16 28.5 16 28.5Z" />
            </clipPath>
          </defs>

          <path
            d="M16 28.5C16 28.5 3 20 3 11.5C3 6.5 6.5 3 11 3C13.5 3 15.3 4.2 16 5.5C16.7 4.2 18.5 3 21 3C25.5 3 29 6.5 29 11.5C29 20 16 28.5 16 28.5Z"
            fill="rgba(20,14,34,0.9)"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          <g clipPath="url(#heartClip)" className={styles.flag}>
            <rect x="3" y="3" width="26" height="26" fill="#000" />
            <rect x="3" y="3" width="26" height="8.67" fill="#007A3D" />
            <rect x="3" y="11.33" width="26" height="8.67" fill="#FFFFFF" />
            <rect x="3" y="20" width="26" height="8.67" fill="#000" />
            <polygon points="3,3 14,16 3,29" fill="#CE1126" />
          </g>
        </svg>
        <span className={styles.glow} aria-hidden />
      </div>

      <span className={styles.text}>فلسطين في القلب</span>
    </Link>
  )
}
