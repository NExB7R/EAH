'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import styles from './analytics.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Analytics Tabs + Period Selector
// ═══════════════════════════════════════════════════════════

type TabKey = 'overview' | 'reports' | 'moderation'

const TABS: { key: TabKey; label: string; href: string }[] = [
  { key: 'overview', label: 'التحليلات', href: '/admin/analytics' },
  { key: 'reports', label: 'الإبلاغات', href: '/admin/analytics?tab=reports' },
  { key: 'moderation', label: 'المراجعة', href: '/admin/analytics?tab=moderation' },
]

const PERIODS = [
  { days: 7, label: '7 أيام' },
  { days: 14, label: '14 يوم' },
  { days: 30, label: '30 يوم' },
  { days: 90, label: '90 يوم' },
]

type Props = {
  reportsCount?: number
  moderationCount?: number
}

export default function AnalyticsTabs({ reportsCount = 0, moderationCount = 0 }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = (searchParams.get('tab') ?? 'overview') as TabKey
  const currentDays = parseInt(searchParams.get('days') ?? '30', 10) || 30

  return (
    <>
      <nav className={styles.tabs} aria-label="أقسام التحليلات">
        {TABS.map((t) => {
          const active = t.key === currentTab
          const badge =
            t.key === 'reports' ? reportsCount : t.key === 'moderation' ? moderationCount : 0
          return (
            <Link
              key={t.key}
              href={t.href}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span>{t.label}</span>
              {badge > 0 && <span className={styles.tabBadge}>{badge > 99 ? '99+' : badge}</span>}
            </Link>
          )
        })}
      </nav>

      {currentTab === 'overview' && (
        <nav className={styles.periodBar} aria-label="الفترة الزمنية">
          {PERIODS.map((p) => {
            const active = p.days === currentDays
            const params = new URLSearchParams(searchParams.toString())
            params.set('days', String(p.days))
            return (
              <Link
                key={p.days}
                href={`${pathname}?${params.toString()}`}
                className={`${styles.periodBtn} ${active ? styles.periodBtnActive : ''}`}
              >
                {p.label}
              </Link>
            )
          })}
        </nav>
      )}
    </>
  )
}
