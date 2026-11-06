'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getAvatarImageUrl } from '@/lib/avatar-url'
import type { AppRole } from '@/lib/data/user'
import { BadgeCheckIcon, CrownGoldIcon } from './icons'
import styles from './avatar.module.css'

type AvatarProps = {
  displayName: string
  avatarUrl: string | null
  role: AppRole
  isVerified?: boolean
  isPaidMember?: boolean
  priority?: boolean
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
  // Fallback آمن: لو الاسم فاضي أو مش نص، يرجع '؟' بدل ما يعرض رموز غريبة
  const safeName = (displayName ?? '').toString().trim()
  const initial = safeName.length > 0 && /[\p{L}\p{N}]/u.test(safeName) 
    ? safeName.charAt(0) 
    : '؟'
  
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const sizeCls = styles[size]
  const roleCls = role === 'super_admin' ? styles.admin : isPaidMember ? styles.paid : ''
  const cls = [styles.avatar, sizeCls, roleCls].filter(Boolean).join(' ')
  const targetWidth = size === 'lg' ? 160 : size === 'md' ? 96 : size === 'sm' ? 64 : 48
  const imageSrc = getAvatarImageUrl(avatarUrl, targetWidth)

  // تأكد إن URL صالح فعلاً (يبدأ بـ http)
  const isValidUrl = !!imageSrc && (imageSrc.startsWith('http://') || imageSrc.startsWith('https://') || imageSrc.startsWith('/'))
  const showImage = isValidUrl && failedSrc !== imageSrc

  return (
    <div className={cls}>
      {showImage ? (
        <Image
          src={imageSrc!}
          alt={safeName || 'مستخدم'}
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
