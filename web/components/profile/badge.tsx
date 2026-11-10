import type { BadgeKind } from '@/lib/profile/role-theme'
import { BADGE_META } from '@/lib/profile/role-theme'
import styles from './badge.module.css'

type Props = { kind: BadgeKind; size?: 'sm' | 'md' }

export function Badge({ kind, size = 'sm' }: Props) {
  const meta = BADGE_META[kind]
  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={{ background: meta.bg, color: meta.fg }}
      aria-label={meta.label}
    >
      {meta.label}
    </span>
  )
}
