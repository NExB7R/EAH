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

export default function CardImage({ logoUrl, coverUrl, alt, initial }: Props) {
  const [logoFailed, setLogoFailed] = useState(false)
  const [coverFailed, setCoverFailed] = useState(false)

  // A cover photo tells the buyer more about the place than a large logo.
  // Keep the logo as a small brand marker when both assets exist.
  const showCover = !!coverUrl && !coverFailed
  const showLogo = !!logoUrl && !logoFailed
  const showLogoFallback = !showCover && showLogo

  return (
    <>
      {showCover ? (
        <Image
          src={coverUrl!}
          alt={alt}
          fill
          priority={false}
          sizes="(max-width: 400px) 340px, (max-width: 640px) 400px, (max-width: 1024px) 440px, 480px"
          className={styles.cover}
          onError={() => setCoverFailed(true)}
        />
      ) : showLogoFallback ? (
        <Image
          src={logoUrl!}
          alt={alt}
          fill
          sizes="(max-width: 400px) 340px, (max-width: 640px) 400px, (max-width: 1024px) 440px, 480px"
          className={styles.logo}
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <div className={styles.placeholder} aria-hidden>
          <span className={styles.placeholderInitial}>{initial}</span>
        </div>
      )}

      {showCover && showLogo && (
        <span className={styles.logoBadge} aria-hidden>
          <Image
            src={logoUrl!}
            alt=""
            fill
            sizes="48px"
            className={styles.logoBadgeImg}
            onError={() => setLogoFailed(true)}
          />
        </span>
      )}
    </>
  )
}
