'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  LayoutDashboardIcon,
  AlertIcon,
  StoreIcon,
  UserIcon,
  CrownGoldIcon,
  ChevronLeftIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
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
      { href: '/admin/analytics', label: 'التحليلات', Icon: TrendingUpIcon },
    ],
  },
  {
    key: 'platform',
    title: 'إدارة المنصة',
    items: [
      {
        href: '/admin/businesses',
        label: 'الأنشطة',
        Icon: StoreIcon,
        badgeKey: 'pendingBusinesses',
      },
      { href: '/admin/users', label: 'المستخدمين', Icon: UserIcon },
    ],
  },
  {
    key: 'trust',
    title: 'المراجعة والثقة',
    items: [
      {
        href: '/admin/moderation',
        label: 'المراجعة والأمان',
        Icon: ShieldCheckIcon,
        badgeKey: 'moderationWork',
      },
    ],
  },
  {
    key: 'growth',
    title: 'النمو التجاري',
    items: [
      {
        href: '/admin/subscriptions',
        label: 'الاشتراكات',
        Icon: CrownGoldIcon,
        badgeKey: 'pendingSubscriptions',
      },
      { href: '/admin/ads', label: 'الإعلانات', Icon: TagIcon },
      { href: '/admin/featured', label: 'الأنشطة المميزة', Icon: CrownGoldIcon },
    ],
  },
  {
    key: 'communication',
    title: 'التواصل',
    items: [{ href: '/admin/notifications', label: 'الإشعارات والرسائل', Icon: BellIcon }],
  },
  {
    key: 'system',
    title: 'النظام والأدوات',
    defaultOpen: false,
    items: [
      { href: '/admin/studio', label: 'الاستوديو', Icon: SparklesIcon },
      { href: '/admin/health', label: 'صحة النظام والأخطاء', Icon: AlertIcon },
      { href: '/admin/insights', label: 'تخزين التقارير الذكية', Icon: SparklesIcon },
      { href: '/admin/profile', label: 'بروفايلي', Icon: UserIcon },
    ],
  },
]

export default function AdminSidebar({ counts, onNavigate }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [manualOverrides, setManualOverrides] = useState<Map<string, boolean>>(() => new Map())

  const openSections = useMemo(() => {
    const active = SECTIONS.find((section) => sectionContainsPath(section, pathname))
    const result = new Set<string>()
    for (const section of SECTIONS) {
      const override = manualOverrides.get(section.key)
      if (override !== undefined) {
        if (override) result.add(section.key)
        continue
      }
      const defaultOpen = section.defaultOpen !== false
      const isActive = active?.key === section.key
      if (defaultOpen || isActive) result.add(section.key)
    }
    return result
  }, [pathname, manualOverrides])

  const toggleSection = (key: string) => {
    setManualOverrides((previous) => {
      const next = new Map(previous)
      const isCurrentlyOpen = openSections.has(key)
      next.set(key, !isCurrentlyOpen)
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
              <ul id={`admin-section-${section.key}`} hidden={!sectionOpen} className={styles.list}>
                {section.items.map(({ href, label, Icon, badgeKey }) => {
                  const [baseHref = href, queryString] = href.split('?')
                  const targetTab = queryString ? new URLSearchParams(queryString).get('tab') : null
                  const active =
                    baseHref === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(baseHref) &&
                        (targetTab ? searchParams.get('tab') === targetTab : true)
                  const badgeValue =
                    badgeKey === 'moderationWork'
                      ? (counts?.flaggedReviews ?? 0) + (counts?.openReports ?? 0)
                      : badgeKey
                        ? counts?.[badgeKey]
                        : undefined
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
          )
        })}
      </nav>
    </aside>
  )
}
