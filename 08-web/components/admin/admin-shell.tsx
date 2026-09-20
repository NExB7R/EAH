'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MI } from '@/components/neon-icons-menu'
import EahLogo from '@/components/eah-logo'
import './admin-shell.css'
import './admin-shell-polish.css'
import { IcMenu } from '@/components/eah-icons'
import PendingBadge from './pending-badge'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
  liveBadge?: boolean
}

type NavSection = { title: string; items: NavItem[] }

export default function AdminShell({
  children,
  pendingChanges,
}: {
  children: React.ReactNode
  pendingChanges?: number
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  // استرجاع حالة الـ collapsed من localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('eah_admin_sidebar_collapsed')
      if (saved === '1') setCollapsed(true)
    } catch {}
  }, [])

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('eah_admin_sidebar_collapsed', next ? '1' : '0') } catch {}
      return next
    })
  }

  const sections: NavSection[] = [
    {
      title: 'الرئيسية',
      items: [
        { href: '/admin', label: 'نظرة عامة', icon: MI.trending },
        { href: '/admin/analytics', label: 'الإحصائيات', icon: MI.trending },
      ],
    },
    {
      title: 'المحتوى',
      items: [
        { href: '/admin/pending', label: 'الطلبات المعلقة', icon: MI.inbox, liveBadge: true },
        { href: '/admin/businesses', label: 'الأنشطة', icon: MI.store },
        { href: '/admin/offers', label: 'العروض', icon: MI.fire },
        { href: '/admin/ads', label: 'الإعلانات', icon: MI.megaphone },
        { href: '/admin/reviews', label: 'التقييمات', icon: MI.sparkles },
      ],
    },
    {
      title: 'الاشتراكات',
      items: [
        { href: '/admin/subscriptions', label: 'الاشتراكات', icon: MI.sparkles },
        { href: '/admin/subscriptions/plans', label: 'الباقات', icon: MI.lock },
      ],
    },
    {
      title: 'المستخدمين',
      items: [
        { href: '/admin/users', label: 'المستخدمين', icon: MI.info },
        { href: '/admin/points', label: 'النقاط', icon: MI.sparkles },
        { href: '/admin/merchants', label: 'طلبات التجار', icon: MI.store },
      ],
    },
    {
      title: 'النظام',
      items: [
        { href: '/admin/studio', label: 'الاستوديو', icon: MI.sparkles },
        { href: '/admin/settings/notifications', label: 'الإشعارات', icon: MI.chat },
        { href: '/admin/security', label: 'الأمان', icon: MI.shield },
        { href: '/admin/audit', label: 'سجل العمليات', icon: MI.lock },
      ],
    },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="admin-shell" data-mobile-open={mobileOpen} data-collapsed={collapsed}>
      <div className="admin-overlay" onClick={() => setMobileOpen(false)} aria-hidden />

      <aside className="admin-sidebar">
        {/* اللوجو */}
        <div className="admin-sidebar__logo">
          <EahLogo size="sm" variant="compact" href="/admin" />
        </div>

        {/* زر الفتح/الإغلاق (للـ desktop) */}
        <button
          type="button"
          className="admin-sidebar__toggle"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'فتح القائمة' : 'إغلاق القائمة'}
          title={collapsed ? 'فتح القائمة' : 'إغلاق القائمة'}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {collapsed
              ? <><line x1="3" y1="12" x2="21" y2="12"/><polyline points="9 6 15 12 9 18"/></>
              : <><line x1="3" y1="12" x2="21" y2="12"/><polyline points="15 6 9 12 15 18"/></>
            }
          </svg>
        </button>

        <nav className="admin-sidebar__nav">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="admin-sidebar__section">{section.title}</div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="admin-sidebar__link"
                  data-active={isActive(item.href)}
                  title={collapsed ? item.label : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="admin-sidebar__link-icon" aria-hidden>{item.icon}</span>
                  <span className="admin-sidebar__link-label">{item.label}</span>
                  {item.liveBadge && <PendingBadge initial={pendingChanges ?? 0} />}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="admin-sidebar__link-badge">{item.badge}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__bottom">
          <Link href="/" className="admin-sidebar__link" title="الموقع">
            <span className="admin-sidebar__link-icon" aria-hidden>{MI.compass}</span>
            <span className="admin-sidebar__link-label">الموقع</span>
          </Link>
          <form action="/admin/logout" method="post">
            <button type="submit" className="admin-sidebar__link" style={{ width: '100%', cursor: 'pointer', background: 'transparent', border: 'none' }} title="خروج">
              <span className="admin-sidebar__link-icon" aria-hidden>{MI.logout}</span>
              <span className="admin-sidebar__link-label">خروج</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="admin-main">
        <button
          type="button"
          className="admin-mobile-trigger"
          onClick={() => setMobileOpen(true)}
          aria-label="القائمة"
        >
          <IcMenu />
        </button>
        {children}
      </main>
    </div>
  )
}
