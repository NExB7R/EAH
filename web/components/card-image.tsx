'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './business-card.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Card Image (logo → cover → initial fallback)
//   • Logo takes priority (padded inside gradient)
//   • Falls back to cover on logo error
//   • Falls back to initial if both fail
// ═══════════════════════════════════════════════════════════

type Props = {
  logoUrl: string | null
  coverUrl: string | null
  alt: string
  initial: string
}

export default function CardImage({ logoUrl, coverUrl, alt, initial }: Props) {
  const [logoFailed, setLogoFailed] = useState(false)
  const [coverFailed, setCoverFailed] = useState(false)

  const showLogo = !!logoUrl && !logoFailed
  const showCover = !showLogo && !!coverUrl && !coverFailed

  if (showLogo || showCover) {
    const src = showLogo ? logoUrl! : coverUrl!
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 400px) 340px, (max-width: 640px) 400px, (max-width: 1024px) 440px, 480px"
        className={showLogo ? styles.logo : styles.cover}
        style={{ objectFit: showLogo ? 'contain' : 'cover' }}
        onError={() => (showLogo ? setLogoFailed(true) : setCoverFailed(true))}
      />
    )
  }

  return (
    <div className={styles.placeholder} aria-hidden>
      <span className={styles.placeholderInitial}>{initial}</span>
    </div>
  )
}
