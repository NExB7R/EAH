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
// 4 sections: نظرة عامة / الإدارة / المراجعة والأمان / النظام
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
  badgeKey?: keyof NonNullable<Props['counts']>
}

type Section = {
  title: string
  items: Item[]
}

const SECTIONS: Section[] = [
  {
    title: 'الرئيسية',
    items: [
      { href: '/admin', label: 'لوحة التحكم', Icon: LayoutDashboardIcon },
      { href: '/admin/analytics', label: 'التحليلات والتقارير', Icon: TrendingUpIcon },
    ],
  },
  {
    title: 'إدارة المنصة',
    items: [
      {
        href: '/admin/businesses',
        label: 'الأنشطة',
        Icon: StoreIcon,
        badgeKey: 'pendingBusinesses',
      },
      { href: '/admin/users', label: 'المستخدمين', Icon: UserIcon },
      { href: '/admin/business-types', label: 'أنواع الأنشطة', Icon: SparklesIcon },
    ],
  },
  {
    title: 'النمو والإيرادات',
    items: [
      {
        href: '/admin/subscriptions',
        label: 'الاشتراكات',
        Icon: CrownGoldIcon,
        badgeKey: 'pendingSubscriptions',
      },
      { href: '/admin/ads', label: 'الإعلانات', Icon: TagIcon },
      { href: '/admin/featured', label: 'المميزون', Icon: CrownGoldIcon },
    ],
  },
  {
    title: 'المحتوى والثقة',
    items: [
      {
        href: '/admin/moderation',
        label: 'المراجعة والأمان',
        Icon: ShieldCheckIcon,
        badgeKey: 'flaggedReviews',
      },
      {
        href: '/admin/moderation?tab=reports',
        label: 'بلاغات المستخدمين',
        Icon: FileTextIcon,
        badgeKey: 'openReports',
      },
      { href: '/admin/fraud', label: 'مراجعة الأنشطة المشبوهة', Icon: AlertIcon },
    ],
  },
  {
    title: 'التواصل والرؤى',
    items: [
      { href: '/admin/announcements', label: 'الإعلانات والتنبيهات', Icon: BellIcon },
      { href: '/admin/notifications', label: 'الإشعارات والرسائل', Icon: BellIcon },
      { href: '/admin/insights', label: 'الرؤى الذكية', Icon: SparklesIcon },
    ],
  },
  {
    title: 'النظام والإعدادات',
    items: [
      { href: '/admin/studio', label: 'الاستوديو', Icon: SparklesIcon },
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
                const [baseHref, queryString] = href.split('?')
                const targetTab = queryString ? new URLSearchParams(queryString).get('tab') : null
                const isModerationPage = baseHref === '/admin/moderation'
                const active = baseHref === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(baseHref) && (targetTab
                    ? searchParams.get('tab') === targetTab
                    : !(isModerationPage && searchParams.get('tab') === 'reports')))
                const badgeValue = badgeKey ? counts?.[badgeKey] : undefined
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
