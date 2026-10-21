'use client'

import Link from 'next/link'
import { BellIcon, SearchIcon, UserIcon } from '@/components/icons'
import AdminMobileNav from './admin-mobile-nav'
import styles from './admin-topbar.module.css'

type Props = {
  displayName: string
  notificationCount: number
  counts?: {
    pendingBusinesses?: number
    flaggedReviews?: number
    pendingSubscriptions?: number
    openReports?: number
  }
}

export default function AdminTopbar({ displayName, notificationCount, counts }: Props) {
  const initials = displayName.trim().slice(0, 1) || 'م'
  const openSearch = () => window.dispatchEvent(new Event('eah:open-command-palette'))

  return (
    <header className={styles.topbar}>
      <div className={styles.mobileMenu}>
        <AdminMobileNav counts={counts} />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.searchButton} onClick={openSearch}>
          <SearchIcon size={17} />
          <span>ابحث عن صفحة أو إجراء</span>
          <kbd>Ctrl K</kbd>
        </button>

        <Link
          href="/admin/notifications?tab=inbox"
          className={styles.iconButton}
          aria-label={notificationCount > 0 ? `الوارد، ${notificationCount} غير مقروء` : 'الوارد'}
        >
          <BellIcon size={19} />
          {notificationCount > 0 && (
            <span className={styles.notificationDot} aria-hidden="true" />
          )}
        </Link>

        <div className={styles.profile} role="group" aria-label="الحساب الحالي">
          <span className={styles.avatar} aria-hidden="true">{initials}</span>
          <span className={styles.profileText}>
            <strong>{displayName}</strong>
            <small>مدير المنصة</small>
          </span>
          <UserIcon size={15} className={styles.profileIcon} />
        </div>
      </div>
    </header>
  )
}
