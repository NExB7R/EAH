import type { ProfileRole, BadgeKind } from '@/lib/profile/role-theme'
import { ROLE_THEME } from '@/lib/profile/role-theme'
import Avatar from '@/components/avatar'
import { Badge } from './badge'
import styles from './profile-header.module.css'

type Props = {
  displayName: string
  avatarUrl: string | null
  role: ProfileRole
  roleLabel?: string
  badges?: BadgeKind[]
  subtitle?: string
}

export function ProfileHeader({
  displayName,
  avatarUrl,
  role,
  roleLabel,
  badges = [],
  subtitle,
}: Props) {
  const theme = ROLE_THEME[role]
  return (
    <section
      className={styles.hero}
      style={{ '--role-soft': theme.soft, '--role-on': theme.onSoft } as React.CSSProperties}
    >
      <div className={styles.avatarWrap}>
        <Avatar
          displayName={displayName}
          avatarUrl={avatarUrl}
          role={
            role === 'super_admin' ? 'super_admin' : role === 'merchant' ? 'merchant' : 'customer'
          }
          size="lg"
          priority
        />
      </div>
      <div className={styles.info}>
        <span className={styles.rolePill}>{roleLabel ?? theme.label}</span>
        <h1 className={styles.name}>{displayName}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {badges.length > 0 && (
          <div className={styles.badgeRow}>
            {badges.map((b) => (
              <Badge key={b} kind={b} size="md" />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
