'use client'

import { useState } from 'react'
import type { AppRole } from '@/lib/data/user'
import { BadgeCheckIcon } from './icons'
import styles from './avatar.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Avatar with Role-based Frame + Image Fallback
//   • بلا WmImage — بسيط، سريع، لا watermark
//   • لو الصورة فشلت → يرجع للحرف الأول (بدون كسر التصميم)
// ═══════════════════════════════════════════════════════════

type AvatarProps = {
  displayName: string
  avatarUrl: string | null
  role: AppRole
  phoneVerified?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
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
    role === 'super_admin' || role === 'admin'
      ? styles.admin
      : role === 'merchant'
        ? styles.merchant
        : phoneVerified
          ? styles.verified
          : ''

  const cls = [styles.avatar, sizeCls, roleCls].filter(Boolean).join(' ')
  const showImage = !!avatarUrl && !imgError

  return (
    <div className={cls}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={displayName}
          className={styles.img}
          onError={() => setImgError(true)}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className={styles.initial}>{initial}</span>
      )}

      {(role === 'super_admin' || role === 'admin') && (
        <span className={styles.badge} aria-hidden>
          👑
        </span>
      )}

      {phoneVerified && role !== 'super_admin' && role !== 'admin' && (
        <span className={styles.check} aria-hidden>
          <BadgeCheckIcon size={12} />
        </span>
      )}
    </div>
  )
}
