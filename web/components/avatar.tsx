'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getAvatarImageUrl } from '@/lib/avatar-url'
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
  /** Verified EAH profile; phone verification alone does not grant this badge. */
  isVerified?: boolean
  /** Active paid membership or active paid ad placement. */
  isPaidMember?: boolean
  /** Prioritize the one avatar that must appear immediately (e.g. the global header). */
  priority?: boolean
  /** Kept temporarily for compatibility with older callers. */
  phoneVerified?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export default function Avatar({
  displayName,
  avatarUrl,
  role,
  isVerified = false,
  isPaidMember = false,
  priority = false,
  size = 'md',
}: AvatarProps) {
  const initial = displayName.trim().charAt(0) || '؟'
  // Tie failures to the source URL: a newly uploaded URL gets a fresh load attempt.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const sizeCls = styles[size]
  const roleCls = role === 'super_admin' ? styles.admin : isPaidMember ? styles.paid : ''
  const cls = [styles.avatar, sizeCls, roleCls].filter(Boolean).join(' ')
  const targetWidth = size === 'lg' ? 160 : size === 'md' ? 96 : size === 'sm' ? 64 : 48
  const imageSrc = getAvatarImageUrl(avatarUrl, targetWidth)
  const showImage = !!imageSrc && failedSrc !== imageSrc

  return (
    <div className={cls}>
      {showImage ? (
        <Image
          src={imageSrc!}
          alt={displayName}
          className={styles.img}
          onError={() => setFailedSrc(imageSrc)}
          width={targetWidth}
          height={targetWidth}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          priority={priority}
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

      {isVerified && (
        <span className={styles.check} aria-hidden>
          <BadgeCheckIcon size={12} />
        </span>
      )}
    </div>
  )
}
