'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './business-card.module.css'

type Props = {
  logoUrl: string | null
  coverUrl: string | null
  alt: string
  initial: string
}

/**
 * The cover is the card's primary image. The logo is a small brand marker,
 * never a replacement for a real cover photo. When the cover is missing or
 * fails to load, fall back to the logo and then the activity initial.
 */
export default function CardImage({ logoUrl, coverUrl, alt, initial }: Props) {
  const [logoFailed, setLogoFailed] = useState(false)
  const [coverFailed, setCoverFailed] = useState(false)

  const showCover = Boolean(coverUrl && !coverFailed)
  const showLogo = Boolean(logoUrl && !logoFailed)

  if (showCover) {
    return (
      <>
        <Image
          src={coverUrl!}
          alt={alt}
          fill
          loading="lazy"
          sizes="auto, (max-width: 400px) 200px, (max-width: 640px) 220px, 280px"
          className={styles.cover}
          onError={() => setCoverFailed(true)}
        />
        {showLogo && (
          <span className={styles.logoBadge} aria-hidden="true">
            <Image
              src={logoUrl!}
              alt=""
              fill
              sizes="44px"
              className={styles.logoBadgeImg}
              onError={() => setLogoFailed(true)}
            />
          </span>
        )}
      </>
    )
  }

  if (showLogo) {
    return (
      <Image
        src={logoUrl!}
        alt={alt}
        fill
        loading="lazy"
        sizes="auto, (max-width: 400px) 200px, (max-width: 640px) 220px, 280px"
        className={styles.logo}
        onError={() => setLogoFailed(true)}
      />
    )
  }

  return (
    <div className={styles.placeholder} aria-hidden>
      <span className={styles.placeholderInitial}>{initial}</span>
    </div>
  )
}
