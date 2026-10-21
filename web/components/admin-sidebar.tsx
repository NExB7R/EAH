'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutDashboardIcon,
  AlertIcon,
  StoreIcon,
  UserIcon,
  CrownGoldIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  FileTextIcon,
  SettingsIcon,
  BellIcon,
  TagIcon,
  SparklesIcon,
} from './icons'
import styles from './admin-sidebar.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Sidebar (2026)
// Navigation follows the platform workflow; redirect aliases are not duplicated here.
// ═══════════════════════════════════════════════════════════

type Props = {
  onNavigate?: () => void
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
  badgeKey?: keyof NonNullable<Props['counts']> | 'moderationWork'
}

type Section = {
  title: string
  items: Item[]
}

const SECTIONS: Section[] = [
  {
    title: 'نظرة عامة',
    items: [
      { href: '/admin', label: 'لوحة التحكم', Icon: LayoutDashboardIcon },
      { href: '/admin/analytics', label: 'التحليلات والتقارير', Icon: TrendingUpIcon },
    ],
  },
  {
    title: 'إدارة المنصة',
    items: [
      { href: '/admin/businesses', label: 'الأنشطة', Icon: StoreIcon, badgeKey: 'pendingBusinesses' },
      { href: '/admin/business-types', label: 'أنواع الأنشطة', Icon: SparklesIcon },
      { href: '/admin/users', label: 'المستخدمين', Icon: UserIcon },
    ],
  },
  {
    title: 'المراجعة والثقة',
    items: [
      { href: '/admin/moderation', label: 'المراجعة والأمان', Icon: ShieldCheckIcon, badgeKey: 'moderationWork' },
    ],
  },
  {
    title: 'النمو التجاري',
    items: [
      { href: '/admin/subscriptions', label: 'الاشتراكات', Icon: CrownGoldIcon, badgeKey: 'pendingSubscriptions' },
      { href: '/admin/ads', label: 'الإعلانات', Icon: TagIcon },
      { href: '/admin/featured', label: 'الأنشطة المميزة', Icon: CrownGoldIcon },
      { href: '/admin/insights', label: 'تخزين التقارير الذكية', Icon: SparklesIcon },
    ],
  },
  {
    title: 'التواصل والنظام',
    items: [
      { href: '/admin/notifications', label: 'التواصل والإشعارات', Icon: BellIcon },
      { href: '/admin/studio', label: 'الاستوديو', Icon: SparklesIcon },
      { href: '/admin/health', label: 'صحة النظام والأخطاء', Icon: AlertIcon },
      { href: '/admin/audit', label: 'سجل التدقيق', Icon: FileTextIcon },
      { href: '/admin/profile', label: 'بروفايلي', Icon: UserIcon },
      { href: '/admin/settings', label: 'الإعدادات', Icon: SettingsIcon },
    ],
  },
]

export default function AdminSidebar({ counts, onNavigate }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <aside className={onNavigate ? styles.drawerSidebar : styles.sidebar}>
      <nav className={styles.nav} aria-label="لوحة الأدمن">
        {SECTIONS.map((section) => (
          <div key={section.title} className={styles.section}>
            <h4 className={styles.sectionTitle}>{section.title}</h4>
            <ul className={styles.list}>
              {section.items.map(({ href, label, Icon, badgeKey }) => {
                const [baseHref = href, queryString] = href.split('?')
                const targetTab = queryString ? new URLSearchParams(queryString).get('tab') : null
                const isModerationPage = baseHref === '/admin/moderation'
                const active = baseHref === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(baseHref) && (targetTab
                    ? searchParams.get('tab') === targetTab
                    : !(isModerationPage && searchParams.get('tab') === 'reports'))
                const badgeValue = badgeKey === 'moderationWork'
                  ? (counts?.flaggedReviews ?? 0) + (counts?.openReports ?? 0)
                  : badgeKey ? counts?.[badgeKey] : undefined
                const showBadge = typeof badgeValue === 'number' && badgeValue > 0

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`${styles.item} ${active ? styles.active : ''}`}
                      aria-current={active ? 'page' : undefined}
                      onClick={onNavigate}
                    >
                      <span className={styles.iconWrap}>
                        <Icon size={16} />
                      </span>
                      <span className={styles.label}>{label}</span>
                      {showBadge && (
                        <span className={styles.badge}>{badgeValue > 99 ? '99+' : badgeValue}</span>
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
