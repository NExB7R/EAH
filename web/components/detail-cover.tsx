'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './business-hero.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Detail Cover (client with onError fallback)
// Same pattern as CardImage — prevents empty black boxes
// ═══════════════════════════════════════════════════════════

type Props = {
  src: string | null
  alt: string
}

export default function DetailCover({ src, alt }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || src === failedSrc) {
    return <div className={styles.coverFallback} aria-hidden />
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 900px"
      className={styles.coverImg}
      priority
      onError={() => setFailedSrc(src)}
    />
  )
}
