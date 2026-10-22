'use client'

import { useEffect, useRef, useState } from 'react'
import { MenuIcon, CloseIcon } from '@/components/icons'
import AdminSidebar from '@/components/admin-sidebar'
import styles from './admin-mobile-nav.module.css'

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
  const toggleRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    closeRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
      toggleRef.current?.focus()
    }
  }, [open])

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        onClick={() => setOpen(true)}
        aria-label="فتح قائمة الإدارة"
        aria-expanded={open}
        aria-controls="admin-mobile-nav-drawer"
      >
        <MenuIcon size={20} />
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            id="admin-mobile-nav-drawer"
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-mobile-nav-title"
          >
            <button
              ref={closeRef}
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <CloseIcon size={18} />
            </button>
            <h2 id="admin-mobile-nav-title" className={styles.drawerTitle}>
              التنقل في لوحة الإدارة
            </h2>
            <AdminSidebar counts={counts} onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}
