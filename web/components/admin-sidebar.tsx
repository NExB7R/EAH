'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboardIcon,
  AlertIcon,
  StoreIcon,
  UserIcon,
  CrownGoldIcon,
  ChevronLeftIcon,
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
  key: string
  title: string
  items: Item[]
  defaultOpen?: boolean
}

function sectionContainsPath(section: Section, pathname: string): boolean {
  return section.items.some(({ href }) => {
    const baseHref = href.split('?')[0] ?? href
    return baseHref === '/admin'
      ? pathname === '/admin'
      : pathname === baseHref || pathname.startsWith(`${baseHref}/`)
  })
}

const SECTIONS: Section[] = [
  {
    key: 'overview',
    title: 'نظرة عامة',
    items: [
      { href: '/admin', label: 'لوحة التحكم', Icon: LayoutDashboardIcon },
      { href: '/admin/analytics', label: 'التحليلات والتقارير', Icon: TrendingUpIcon },
    ],
  },
  {
    key: 'platform',
    title: 'إدارة المنصة',
    items: [
      { href: '/admin/businesses', label: 'الأنشطة', Icon: StoreIcon, badgeKey: 'pendingBusinesses' },
      { href: '/admin/business-types', label: 'أنواع الأنشطة', Icon: SparklesIcon },
      { href: '/admin/users', label: 'المستخدمين', Icon: UserIcon },
    ],
  },
  {
    key: 'trust',
    title: 'المراجعة والثقة',
    items: [
      { href: '/admin/moderation', label: 'المراجعة والأمان', Icon: ShieldCheckIcon, badgeKey: 'moderationWork' },
    ],
  },
  {
    key: 'growth',
    title: 'النمو التجاري',
    items: [
      { href: '/admin/subscriptions', label: 'الاشتراكات', Icon: CrownGoldIcon, badgeKey: 'pendingSubscriptions' },
      { href: '/admin/ads', label: 'الإعلانات', Icon: TagIcon },
      { href: '/admin/featured', label: 'الأنشطة المميزة', Icon: CrownGoldIcon },
    ],
  },
  {
    key: 'communication',
    title: 'التواصل',
    items: [
      { href: '/admin/notifications', label: 'التواصل والإشعارات', Icon: BellIcon },
    ],
  },
  {
    key: 'system',
    title: 'النظام والأدوات',
    defaultOpen: false,
    items: [
      { href: '/admin/studio', label: 'الاستوديو والميزات', Icon: SparklesIcon },
      { href: '/admin/health', label: 'صحة النظام والأخطاء', Icon: AlertIcon },
      { href: '/admin/insights', label: 'تخزين التقارير الذكية', Icon: SparklesIcon },
      { href: '/admin/audit', label: 'سجل التدقيق', Icon: FileTextIcon },
      { href: '/admin/profile', label: 'بروفايلي', Icon: UserIcon },
      { href: '/admin/settings', label: 'الإعدادات', Icon: SettingsIcon },
    ],
  },
]

export default function AdminSidebar({ counts, onNavigate }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [openSections, setOpenSections] = useState<Set<string>>(
    () =>
      new Set(
        SECTIONS.filter(
          (section) => section.defaultOpen !== false || sectionContainsPath(section, pathname),
        ).map((section) => section.key),
      ),
  )

  useEffect(() => {
    const activeSection = SECTIONS.find((section) => sectionContainsPath(section, pathname))
    if (!activeSection) return
    setOpenSections((previous) => {
      if (previous.has(activeSection.key)) return previous
      const next = new Set(previous)
      next.add(activeSection.key)
      return next
    })
  }, [pathname])

  const toggleSection = (key: string) => {
    setOpenSections((previous) => {
      const next = new Set(previous)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <aside className={onNavigate ? styles.drawerSidebar : styles.sidebar}>
      <nav className={styles.nav} aria-label="لوحة الأدمن">
        {SECTIONS.map((section) => {
          const sectionOpen = openSections.has(section.key)
          return (
            <div key={section.key} className={styles.section}>
              <button
                type="button"
                className={styles.sectionToggle}
                onClick={() => toggleSection(section.key)}
                aria-expanded={sectionOpen}
                aria-controls={`admin-section-${section.key}`}
              >
                <span className={styles.sectionTitle}>{section.title}</span>
                <ChevronLeftIcon
                  size={13}
                  className={`${styles.sectionChevron} ${sectionOpen ? styles.sectionChevronOpen : ''}`}
                />
              </button>
              <ul
                id={`admin-section-${section.key}`}
                hidden={!sectionOpen}
                className={styles.list}
              >
                {section.items.map(({ href, label, Icon, badgeKey }) => {
                  const [baseHref = href, queryString] = href.split('?')
                  const targetTab = queryString ? new URLSearchParams(queryString).get('tab') : null
                  const active = baseHref === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(baseHref) &&
                      (targetTab ? searchParams.get('tab') === targetTab : true)
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
          )
        })}
      </nav>
    </aside>
  )
}
