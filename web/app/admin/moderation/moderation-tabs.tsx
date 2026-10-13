'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ShieldCheckIcon, TargetIcon, AlertIcon } from '@/components/icons'
import styles from './moderation.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Moderation Tabs
// المراجعة / الإبلاغات / كشف التلاعب
// ═══════════════════════════════════════════════════════════

type TabKey = 'reviews' | 'reports' | 'fraud'

const TABS: { key: TabKey; label: string; Icon: typeof ShieldCheckIcon }[] = [
  { key: 'reviews', label: 'التقييمات', Icon: ShieldCheckIcon },
  { key: 'reports', label: 'الإبلاغات', Icon: TargetIcon },
  { key: 'fraud', label: 'كشف التلاعب', Icon: AlertIcon },
]

type Props = {
  reviewsCount?: number
  reportsCount?: number
  fraudCount?: number
}

export default function ModerationTabs({
  reviewsCount = 0,
  reportsCount = 0,
  fraudCount = 0,
}: Props) {
  const searchParams = useSearchParams()
  const current = (searchParams.get('tab') ?? 'reviews') as TabKey

  return (
    <nav className={styles.tabs} aria-label="أقسام المراجعة">
      {TABS.map((t) => {
        const active = t.key === current
        const href = t.key === 'reviews' ? '/admin/moderation' : `/admin/moderation?tab=${t.key}`
        const badge =
          t.key === 'reviews' ? reviewsCount : t.key === 'reports' ? reportsCount : fraudCount
        return (
          <Link
            key={t.key}
            href={href}
            className={`${styles.tab} ${active ? styles.tabActive : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className={styles.tabIcon}>
              <t.Icon size={16} />
            </span>
            <span className={styles.tabLabel}>{t.label}</span>
            {badge > 0 && <span className={styles.tabBadge}>{badge > 99 ? '99+' : badge}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
