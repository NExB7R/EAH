'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './business-hero.module.css'

type Props = {
  src: string | null
  alt: string
  initial: string
}

export default function DetailLogo({ src, alt, initial }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || src === failedSrc) {
    return (
      <div className={styles.logoFallback} aria-hidden>
        {initial}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="120px"
      className={styles.logoImg}
      loading="eager"
      onError={() => setFailedSrc(src)}
    />
  )
}
