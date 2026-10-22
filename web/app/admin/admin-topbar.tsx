'use client'

import Link from 'next/link'
import { SearchIcon, UserIcon } from '@/components/icons'
import AdminMobileNav from './admin-mobile-nav'
import styles from './admin-topbar.module.css'

type Props = {
  counts?: {
    pendingBusinesses?: number
    flaggedReviews?: number
    pendingSubscriptions?: number
    openReports?: number
  }
}

export default function AdminTopbar({ counts }: Props) {
  const openSearch = () => window.dispatchEvent(new Event('eah:open-command-palette'))

  return (
    <header className={styles.topbar}>
      <div className={styles.mobileMenu}>
        <AdminMobileNav counts={counts} />
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.searchButton}
          onClick={openSearch}
          aria-label="ابحث عن صفحة أو إجراء"
        >
          <SearchIcon size={17} />
          <span>ابحث عن صفحة أو إجراء</span>
          <kbd>Ctrl K</kbd>
        </button>

        <Link
          href="/admin/profile"
          className={styles.profileButton}
          aria-label="بروفايلي"
          title="بروفايلي"
        >
          <UserIcon size={17} />
        </Link>
      </div>
    </header>
  )
}
