'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboardIcon,
  StoreIcon,
  UserIcon,
  CrownGoldIcon,
  GiftIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  FileTextIcon,
  SettingsIcon,
  BellIcon,
  TargetIcon,
  TagIcon,
  SparklesIcon,
} from './icons'
import styles from './admin-sidebar.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Sidebar (Full Control 2026)
// ═══════════════════════════════════════════════════════════

type Badge = 'pending' | 'reports' | 'expiring' | number

type Props = {
  counts?: {
    pendingBusinesses?: number
    flaggedReviews?: number
    pendingSubscriptions?: number
    openReports?: number
  }
}

type Item = {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number }>
  badgeKey?: keyof NonNullable<Props['counts']>
}

type Section = {
  title: string
  items: Item[]
}

const SECTIONS: Section[] = [
  {
    title: 'نظرة عامة',
    items: [
      { href: '/admin', label: 'الرئيسية', Icon: LayoutDashboardIcon },
      { href: '/admin/analytics', label: 'التحليلات', Icon: TrendingUpIcon },
      { href: '/admin/insights', label: 'تخزين التقارير', Icon: SparklesIcon },
    ],
  },
  {
    title: 'الإدارة',
    items: [
      { href: '/admin/businesses', label: 'الأنشطة', Icon: StoreIcon, badgeKey: 'pendingBusinesses' },
      { href: '/admin/users', label: 'المستخدمين', Icon: UserIcon },
      { href: '/admin/subscriptions', label: 'الاشتراكات', Icon: CrownGoldIcon, badgeKey: 'pendingSubscriptions' },
      { href: '/admin/ads', label: 'الإعلانات', Icon: TagIcon },
    ],
  },
  {
    title: 'المراجعة',
    items: [
      { href: '/admin/moderation', label: 'المراجعة', Icon: ShieldCheckIcon, badgeKey: 'flaggedReviews' },
      { href: '/admin/reports', label: 'الإبلاغات', Icon: TargetIcon, badgeKey: 'openReports' },
    ],
  },
  {
    title: 'النظام',
    items: [
      { href: '/admin/notifications', label: 'الإشعارات', Icon: BellIcon },
      { href: '/admin/audit', label: 'سجل التدقيق', Icon: FileTextIcon },
      { href: '/admin/settings', label: 'الإعدادات', Icon: SettingsIcon },
    ],
  },
]

export default function AdminSidebar({ counts }: Props) {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="لوحة الأدمن">
        {SECTIONS.map((section) => (
          <div key={section.title} className={styles.section}>
            <h4 className={styles.sectionTitle}>{section.title}</h4>
            <ul className={styles.list}>
              {section.items.map(({ href, label, Icon, badgeKey }) => {
                const active =
                  href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(href)
                const badgeValue = badgeKey ? counts?.[badgeKey] : undefined
                const showBadge = typeof badgeValue === 'number' && badgeValue > 0

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`${styles.item} ${active ? styles.active : ''}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className={styles.iconWrap}>
                        <Icon size={16} />
                      </span>
                      <span className={styles.label}>{label}</span>
                      {showBadge && (
                        <span className={styles.badge}>
                          {badgeValue > 99 ? '99+' : badgeValue}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
