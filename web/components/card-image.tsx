'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './business-card.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Card Image with graceful fallback
// ═══════════════════════════════════════════════════════════

type Props = {
  src: string | null
  alt: string
  initial: string
  typeLabel: string
}

export default function CardImage({ src, alt, initial, typeLabel }: Props) {
  const [failed, setFailed] = useState(false)
  const showImage = !!src && !failed

  if (!showImage) {
    return (
      <div className={styles.placeholder} aria-hidden>
        <span className={styles.placeholderInitial}>{initial}</span>
        <span className={styles.placeholderType}>{typeLabel}</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 400px) 200px, (max-width: 640px) 220px, (max-width: 1024px) 280px, 440px"
      style={{ objectFit: 'cover' }}
      onError={() => setFailed(true)}
    />
  )
}
