'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronRightIcon } from './icons'
import { ADMIN_GROUPS, type NavGroup } from './admin-sidebar-data'
import GlobalShareAction from './global-share-action'
import styles from './admin-sidebar.module.css'

type Props = {
  onNavigate?: () => void
  counts?: {
    pendingBusinesses?: number
    flaggedReviews?: number
    pendingSubscriptions?: number
    openReports?: number
  }
}

function isActive(pathname: string, href: string, currentTab: string | null): boolean {
  const [baseHref = href, queryString] = href.split('?')
  const targetTab = queryString ? new URLSearchParams(queryString).get('tab') : null

  if (baseHref === '/admin') return pathname === '/admin' && !currentTab
  if (href === '/admin/businesses') {
    return (
      pathname === href || (pathname.startsWith(`${href}/`) && pathname !== '/admin/businesses/new')
    )
  }
  if (pathname === baseHref) {
    if (targetTab) return currentTab === targetTab
    return !currentTab
  }
  if (pathname.startsWith(`${baseHref}/`)) {
    if (targetTab) return currentTab === targetTab
    return true
  }
  return false
}

export default function AdminSidebar({ counts, onNavigate }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab')

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ADMIN_GROUPS.map((g) => [g.key, g.defaultOpen])),
  )

  const toggle = (key: string) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <aside className={onNavigate ? styles.drawerSidebar : styles.sidebar}>
      <nav className={styles.nav} aria-label="لوحة الأدمن">
        {ADMIN_GROUPS.map((group) => (
          <GroupSection
            key={group.key}
            group={group}
            isOpen={openGroups[group.key] ?? false}
            onToggle={() => toggle(group.key)}
            pathname={pathname}
            currentTab={currentTab}
            counts={counts}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </aside>
  )
}

function GroupSection({
  group,
  isOpen,
  onToggle,
  pathname,
  currentTab,
  counts,
  onNavigate,
}: {
  group: NavGroup
  isOpen: boolean
  onToggle: () => void
  pathname: string
  currentTab: string | null
  counts?: Props['counts']
  onNavigate?: () => void
}) {
  const GroupIcon = group.Icon
  const activeCount = group.items.filter((item) => isActive(pathname, item.href, currentTab)).length

  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.groupHeader}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`nav-group-${group.key}`}
      >
        <span className={styles.groupIcon}>
          <GroupIcon size={14} />
        </span>
        <span className={styles.groupTitle}>{group.title}</span>
        {activeCount > 0 && <span className={styles.activeDot} aria-label="صفحة نشطة" />}
        <ChevronRightIcon
          size={14}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        />
      </button>
      {isOpen && (
        <ul id={`nav-group-${group.key}`} className={styles.list}>
          {group.items.map(({ href, label, Icon, badgeKey, isShare }) => {
            if (isShare) {
              return (
                <li key={`${group.key}-${label}`}>
                  <GlobalShareAction className={styles.item} label={label} />
                </li>
              )
            }
            const active = isActive(pathname, href, currentTab)
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
      )}
    </div>
  )
}
