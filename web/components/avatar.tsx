'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { AppRole } from '@/lib/data/user'
import { BadgeCheckIcon, CrownGoldIcon } from './icons'
import styles from './avatar.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Avatar with Role Frame + Image Fallback
//   • Cloudinary transform (w_96, q_auto) for fast load
//   • next/image with unoptimized (Cloudinary transform handles size)
//   • onError → fallback to initial (always visible)
// ═══════════════════════════════════════════════════════════

type AvatarProps = {
  displayName: string
  avatarUrl: string | null
  role: AppRole
  phoneVerified?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

// Cloudinary URL builder — small optimized variant
function optimizeAvatar(url: string, width: number): string {
  if (!url.includes('res.cloudinary.com')) return url
  // Insert transformations: /upload/w_96,h_96,c_fill,f_auto,q_auto/
  return url.replace(/\/upload\/(v\d+\/)?/, `/upload/w_${width},h_${width},c_fill,f_auto,q_auto/`)
}

export default function Avatar({
  displayName,
  avatarUrl,
  role,
  phoneVerified = false,
  size = 'md',
}: AvatarProps) {
  const initial = displayName.trim().charAt(0) || '؟'
  const [imgError, setImgError] = useState(false)

  const sizeCls = styles[size]
  const roleCls =
    role === 'super_admin'
      ? styles.admin
      : role === 'merchant'
        ? styles.merchant
        : phoneVerified
          ? styles.verified
          : ''

  const cls = [styles.avatar, sizeCls, roleCls].filter(Boolean).join(' ')
  const showImage = !!avatarUrl && !imgError

  const targetWidth = size === 'lg' ? 160 : size === 'md' ? 96 : size === 'sm' ? 64 : 48
  const optimizedSrc = avatarUrl ? optimizeAvatar(avatarUrl, targetWidth) : ''

  return (
    <div className={cls}>
      {showImage ? (
        <Image
          src={optimizedSrc}
          alt={displayName}
          className={styles.img}
          onError={() => setImgError(true)}
          width={targetWidth}
          height={targetWidth}
          loading="eager"
          decoding="async"
          priority
          unoptimized
        />
      ) : (
        <span className={styles.initial}>{initial}</span>
      )}

      {role === 'super_admin' && (
        <span className={styles.badge} aria-hidden>
          <CrownGoldIcon size={12} />
        </span>
      )}

      {phoneVerified && role !== 'super_admin' && (
        <span className={styles.check} aria-hidden>
          <BadgeCheckIcon size={12} />
        </span>
      )}
    </div>
  )
}
