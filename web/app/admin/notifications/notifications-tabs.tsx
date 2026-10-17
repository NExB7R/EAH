'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BellIcon, BroadcastIcon, ClockIcon } from '@/components/icons'
import styles from './notifications.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Notifications Tabs
// إرسال / إعلانات / السجل
// ═══════════════════════════════════════════════════════════

type TabKey = 'send' | 'announcements' | 'history'

const TABS: { key: TabKey; label: string; Icon: typeof BellIcon }[] = [
  { key: 'send', label: 'إرسال إشعار', Icon: BellIcon },
  { key: 'announcements', label: 'الإعلانات الإدارية', Icon: BroadcastIcon },
  { key: 'history', label: 'السجل', Icon: ClockIcon },
]

export default function NotificationsTabs() {
  const searchParams = useSearchParams()
  const current = (searchParams.get('tab') ?? 'send') as TabKey

  return (
    <nav className={styles.tabs} aria-label="أقسام الإشعارات">
      {TABS.map((t) => {
        const active = t.key === current
        const href = t.key === 'send' ? '/admin/notifications' : `/admin/notifications?tab=${t.key}`
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
          </Link>
        )
      })}
    </nav>
  )
}
