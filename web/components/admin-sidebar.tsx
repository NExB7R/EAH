'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutDashboardIcon,
  StoreIcon,
  UserIcon,
  CrownGoldIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  AlertIcon,
  FileTextIcon,
  BellIcon,
  BroadcastIcon,
  TagIcon,
  SparklesIcon,
} from './icons'
import styles from './admin-sidebar.module.css'
import GlobalShareAction from './global-share-action'

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
  key: string
  title: string
  items: Item[]
}

const SECTIONS: Section[] = [
  {
    key: 'overview',
    title: 'نظرة عامة',
    items: [
      { href: '/admin', label: 'لوحة التحكم', Icon: LayoutDashboardIcon },
      { href: '/admin/analytics', label: 'التحليلات', Icon: TrendingUpIcon },
      { href: '/admin/health', label: 'صحة النظام', Icon: AlertIcon },
      { href: '/admin/studio', label: 'الاستوديو', Icon: SparklesIcon },
    ],
  },
  {
    key: 'businesses',
    title: 'الأنشطة',
    items: [
      {
        href: '/admin/businesses',
        label: 'كل الأنشطة',
        Icon: StoreIcon,
        badgeKey: 'pendingBusinesses',
      },
      { href: '/admin/businesses/new', label: 'إضافة نشاط', Icon: StoreIcon },
      { href: '/admin/featured', label: 'الأنشطة المميزة', Icon: CrownGoldIcon },
      { href: '/admin/business-types', label: 'أنواع الأنشطة', Icon: SparklesIcon },
    ],
  },
  {
    key: 'reports',
    title: 'التقارير',
    items: [{ href: '/admin/insights', label: 'تقارير الأنشطة', Icon: FileTextIcon }],
  },
  {
    key: 'users',
    title: 'المستخدمون',
    items: [
      { href: '/admin/users', label: 'المستخدمون', Icon: UserIcon },
      {
        href: '/admin/subscriptions',
        label: 'الاشتراكات',
        Icon: CrownGoldIcon,
        badgeKey: 'pendingSubscriptions',
      },
      { href: '/admin/ads', label: 'الإعلانات', Icon: TagIcon },
    ],
  },
  {
    key: 'moderation',
    title: 'المراجعة',
    items: [
      {
        href: '/admin/moderation',
        label: 'التقييمات',
        Icon: ShieldCheckIcon,
        badgeKey: 'flaggedReviews',
      },
      {
        href: '/admin/moderation?tab=reports',
        label: 'البلاغات',
        Icon: FileTextIcon,
        badgeKey: 'openReports',
      },
      {
        href: '/admin/moderation?tab=fraud',
        label: 'كشف الاحتيال',
        Icon: AlertIcon,
      },
    ],
  },
  {
    key: 'comms',
    title: 'التواصل',
    items: [
      { href: '/admin/notifications', label: 'الإشعارات والرسائل', Icon: BellIcon },
      {
        href: '/admin/notifications?tab=announcements',
        label: 'الإعلانات العامة',
        Icon: BroadcastIcon,
      },
    ],
  },
  {
    key: 'account',
    title: 'حسابي',
    items: [{ href: '/admin/profile', label: 'بروفايلي', Icon: UserIcon }],
  },
]

export default function AdminSidebar({ counts, onNavigate }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab')

  return (
    <aside className={onNavigate ? styles.drawerSidebar : styles.sidebar}>
      <nav className={styles.nav} aria-label="لوحة الأدمن">
        {SECTIONS.map((section) => (
          <div key={section.key} className={styles.section}>
            <h4 className={styles.sectionTitle}>{section.title}</h4>
            <ul className={styles.list}>
              {section.items.map(({ href, label, Icon, badgeKey }) => {
                const [baseHref = href, queryString] = href.split('?')
                const targetTab = queryString ? new URLSearchParams(queryString).get('tab') : null

                // Active logic:
                // - Base item (no tab): active on /admin exact, or when no tab on URL, or on sub-paths
                // - Tab item: active only when pathname matches base AND tab matches
                let active = false
                if (baseHref === '/admin') {
                  active = pathname === '/admin' && !currentTab
                } else if (href === '/admin/businesses') {
                  active =
                    pathname === href ||
                    (pathname.startsWith(`${href}/`) && pathname !== '/admin/businesses/new')
                } else if (pathname === baseHref || pathname.startsWith(`${baseHref}/`)) {
                  if (targetTab) {
                    active = pathname === baseHref && currentTab === targetTab
                  } else {
                    active = !currentTab || pathname !== baseHref
                  }
                }

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
        <ul className={styles.list}>
          <li><GlobalShareAction className={styles.item} label="شارك المنصة + QR" /></li>
        </ul>
      </nav>
    </aside>
  )
}
