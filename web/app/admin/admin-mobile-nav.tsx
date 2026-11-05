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

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function AdminMobileNav({ counts }: Props) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : toggleRef.current
    const previousOverflow = document.body.style.overflow
    const drawer = drawerRef.current

    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const getFocusableElements = () =>
      Array.from(drawer?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []).filter(
        (element) =>
          element.getAttribute('aria-disabled') !== 'true' &&
          !element.hasAttribute('hidden') &&
          element.getAttribute('aria-hidden') !== 'true',
      )

    const closeOnEscapeAndTrapFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) {
        event.preventDefault()
        drawer?.focus()
        return
      }

      if (event.shiftKey && (document.activeElement === firstElement || !drawer?.contains(document.activeElement))) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && (document.activeElement === lastElement || !drawer?.contains(document.activeElement))) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', closeOnEscapeAndTrapFocus)

    return () => {
      window.removeEventListener('keydown', closeOnEscapeAndTrapFocus)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
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
            ref={drawerRef}
            id="admin-mobile-nav-drawer"
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-mobile-nav-title"
            tabIndex={-1}
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
