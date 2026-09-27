'use client'

import Link from 'next/link'
import { useState } from 'react'
import styles from './palestine-heart.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Palestine Heart (neon gold heart + animated flag)
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
      <span className={styles.heartWrap} aria-hidden>
        <svg
          viewBox="0 0 100 100"
          className={styles.heartSvg}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="eahHeartClip">
              <path d="M50 88C50 88 8 60 8 32C8 18 18 8 32 8C40 8 46 12 50 18C54 12 60 8 68 8C82 8 92 18 92 32C92 60 50 88 50 88Z" />
            </clipPath>
          </defs>

          {/* Flag inside heart */}
          <g clipPath="url(#eahHeartClip)">
            <rect x="0" y="0" width="100" height="33.3" fill="#007A3D" />
            <rect x="0" y="33.3" width="100" height="33.4" fill="#FFFFFF" />
            <rect x="0" y="66.7" width="100" height="33.3" fill="#000000" />
            <polygon points="0,0 33,50 0,100" fill="#CE1126" />
          </g>

          {/* Heart outline (gold neon) */}
          <path
            d="M50 88C50 88 8 60 8 32C8 18 18 8 32 8C40 8 46 12 50 18C54 12 60 8 68 8C82 8 92 18 92 32C92 60 50 88 50 88Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        <span className={styles.glow} aria-hidden />
      </span>

      <span className={styles.text}>فلسطين في القلب</span>
    </Link>
  )
}
