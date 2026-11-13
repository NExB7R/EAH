'use client'

import Link from 'next/link'
import { UserIcon, BellIcon } from '@/components/icons'
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
  return (
    <header className={styles.topbar}>
      <div className={styles.mobileMenu}>
        <AdminMobileNav counts={counts} />
      </div>

      <div className={styles.actions}>
        <Link
          href="/admin/notifications"
          className={styles.iconButton}
          aria-label="الإشعارات"
          title="الإشعارات"
        >
          <BellIcon size={18} />
        </Link>

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
