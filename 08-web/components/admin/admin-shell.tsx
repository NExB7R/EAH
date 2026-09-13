'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './admin-shell.css'

type NavItem = {
  href: string
  label: string
  icon: string
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
        { href: '/admin', label: 'نظرة عامة', icon: '📊' },
        { href: '/admin/analytics', label: 'الإحصائيات', icon: '📈' },
      ],
    },
    {
      title: 'المحتوى',
      items: [
        { href: '/admin/businesses', label: 'الأنشطة', icon: '🏪' },
        { href: '/admin/offers', label: 'العروض', icon: '🔥' },
        { href: '/admin/ads', label: 'الإعلانات', icon: '📣' },
        { href: '/admin/reviews', label: 'التقييمات', icon: '⭐' },
        {
          href: '/admin/change-requests',
          label: 'طلبات التعديل',
          icon: '📝',
          badge: pendingChanges,
        },
      ],
    },
    {
      title: 'الاشتراكات',
      items: [
        { href: '/admin/subscriptions', label: 'الاشتراكات', icon: '💎' },
        { href: '/admin/subscriptions/plans', label: 'الباقات', icon: '⚙️' },
      ],
    },
    {
      title: 'المستخدمين',
      items: [
        { href: '/admin/users', label: 'المستخدمين', icon: '👥' },
        { href: '/admin/merchants', label: 'طلبات التجار', icon: '🧾' },
      ],
    },
    {
      title: 'النظام',
      items: [
        { href: '/admin/studio', label: 'الاستوديو', icon: '🎨' },
        { href: '/admin/security', label: 'الأمان', icon: '🛡️' },
        { href: '/admin/audit', label: 'سجل العمليات', icon: '📜' },
      ],
    },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="admin-shell" data-mobile-open={mobileOpen}>
      {/* Overlay for mobile */}
      <div
        className="admin-overlay"
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      {/* Sidebar */}
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
                  <span aria-hidden>{item.icon}</span>
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
            <span aria-hidden>🏠</span>
            <span>الموقع</span>
          </Link>
          <form action="/admin/logout" method="post">
            <button type="submit" className="admin-sidebar__link" style={{ width: '100%', cursor: 'pointer', background: 'transparent', border: 'none' }}>
              <span aria-hidden>🚪</span>
              <span>خروج</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Mobile trigger */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="admin-mobile-trigger"
            onClick={() => setMobileOpen(true)}
            aria-label="القائمة"
          >
            ☰
          </button>
        </div>
        {children}
      </main>
    </div>
  )
}
