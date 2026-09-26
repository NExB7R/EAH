import WmImage from './wm-image'
import type { AppRole } from '@/lib/data/user'
import { BadgeCheckIcon } from './icons'
import styles from './avatar.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Avatar with Role-based Frame
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

  return (
    <div className={cls}>
      {avatarUrl ? (
        <WmImage
          src={avatarUrl}
          alt={displayName}
          width={40}
          height={40}
          className={styles.img}
          noWatermark
        />
      ) : (
        <span className={styles.initial}>{initial}</span>
      )}

      {(role === 'super_admin' || role === 'admin') && (
        <span className={styles.badge} aria-hidden>👑</span>
      )}

      {phoneVerified && role !== 'super_admin' && role !== 'admin' && (
        <span className={styles.check} aria-hidden>
          <BadgeCheckIcon size={12} />
        </span>
      )}
    </div>
  )
}
