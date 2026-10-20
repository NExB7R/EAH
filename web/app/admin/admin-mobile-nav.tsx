'use client'

import { useState } from 'react'
import { MenuIcon, CloseIcon } from '@/components/icons'
import AdminSidebar from '@/components/admin-sidebar'
import styles from './admin-mobile-nav.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Mobile Nav
// Hamburger button + slide-in drawer. Hidden on desktop.
// ═══════════════════════════════════════════════════════════

type Props = {
  counts?: {
    pendingBusinesses?: number
    flaggedReviews?: number
    pendingSubscriptions?: number
    openReports?: number
  }
}

export default function AdminMobileNav({ counts }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen(true)}
        aria-label="فتح القائمة"
      >
        <MenuIcon size={20} />
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden />
          <div className={styles.drawer} role="dialog" aria-modal="true">
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
            >
              <CloseIcon size={18} />
            </button>
            <AdminSidebar counts={counts} />
          </div>
        </>
      )}
    </>
  )
}
