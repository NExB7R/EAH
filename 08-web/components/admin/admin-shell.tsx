'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MI } from '@/components/neon-icons-menu'
import './admin-shell.css'
import './admin-shell-polish.css'
import { IcMenu } from '@/components/eah-icons'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

type NavSection = {
  title: string
  items: NavItem[]
}

export default function AdminShell({
  children,
  pendingChanges,
}: {
  children: React.ReactNode
  pendingChanges?: number
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

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
        { href: '/admin/collect', label: 'جمع أماكن', icon: MI.sparkles },
        { href: '/admin/businesses', label: 'الأنشطة', icon: MI.store },
        { href: '/admin/offers', label: 'العروض', icon: MI.fire },
        { href: '/admin/ads', label: 'الإعلانات', icon: MI.megaphone },
        { href: '/admin/reviews', label: 'التقييمات', icon: MI.sparkles },
        {
          href: '/admin/change-requests',
          label: 'طلبات التعديل',
          icon: MI.info,
          badge: pendingChanges,
        },
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
    <div className="admin-shell" data-mobile-open={mobileOpen}>
      <div
        className="admin-overlay"
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      <aside className="admin-sidebar">
        <Link
          href="/admin"
          className="admin-sidebar__brand"
          onClick={() => setMobileOpen(false)}
        >
          EAH
          <span>B7R CONTROL</span>
        </Link>

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
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="admin-sidebar__link-icon" aria-hidden>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="admin-sidebar__link-badge">{item.badge}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__bottom">
          <Link href="/" className="admin-sidebar__link">
            <span className="admin-sidebar__link-icon" aria-hidden>{MI.compass}</span>
            <span>الموقع</span>
          </Link>
          <form action="/admin/logout" method="post">
            <button type="submit" className="admin-sidebar__link" style={{ width: '100%', cursor: 'pointer', background: 'transparent', border: 'none' }}>
              <span className="admin-sidebar__link-icon" aria-hidden>{MI.logout}</span>
              <span>خروج</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="admin-main">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="admin-mobile-trigger"
            onClick={() => setMobileOpen(true)}
            aria-label="القائمة"
          >
            <IcMenu />
          </button>
        </div>
        {children}
      </main>
    </div>
  )
}
