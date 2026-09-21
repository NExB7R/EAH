'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import EahLogo from '@/components/eah-logo'
import PendingBadge from './pending-badge'
import { useRouter } from 'next/navigation'
import './admin-shell.css'
import './admin-shell-polish.css'

// ═══ Icons (SVG نظيفة) ═══
const I = {
  menu: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevronLeft: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 6 9 12 15 18"/></svg>,
  chevronRight: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>,
  home: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-7h-4v7H5a2 2 0 0 1-2-2z"/></svg>,
  chart: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  inbox: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  store: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18"/><path d="M8 13v4M12 13v4M16 13v4"/></svg>,
  fire: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  megaphone: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  star: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 6.5 7 1-5 4.8 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.5l7-1z"/></svg>,
  crown: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3 3 6-6 6 6 3-3v11H3z"/><path d="M3 19h18"/></svg>,
  users: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  gift: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4"/><rect x="5" y="12" width="14" height="10"/><path d="M12 8v14M12 8c-1-3-4-3-4-1s3 1 4 1c1 0 4 1 4-1s-3-2-4 1z"/></svg>,
  sparkles: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z"/><path d="M19 15l.8 3 3 .8-3 .8-.8 3-.8-3-3-.8 3-.8z"/></svg>,
  shield: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  log: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  compass: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  logout: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  bell: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  search: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  external: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
}

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
  liveBadge?: boolean
  external?: boolean
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
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    try {
      const saved = localStorage.getItem('eah_admin_sidebar_collapsed')
      if (saved === '1') setCollapsed(true)
    } catch {}
  }, [])

  // اقفل الـ mobile لما يتغير الـ path
  useEffect(() => { setMobileOpen(false) }, [pathname])

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('eah_admin_sidebar_collapsed', next ? '1' : '0') } catch {}
      return next
    })
  }

  const sections: NavSection[] = [
    {
      title: 'عام',
      items: [
        { href: '/admin', label: 'نظرة عامة', icon: I.home },
        { href: '/admin/analytics', label: 'الإحصائيات', icon: I.chart },
      ],
    },
    {
      title: 'المحتوى',
      items: [
        { href: '/admin/pending', label: 'الطلبات المعلقة', icon: I.inbox, liveBadge: true },
        { href: '/admin/businesses', label: 'الأنشطة', icon: I.store },
        { href: '/admin/offers', label: 'العروض', icon: I.fire },
        { href: '/admin/ads', label: 'الإعلانات', icon: I.megaphone },
        { href: '/admin/reviews', label: 'التقييمات', icon: I.star },
      ],
    },
    {
      title: 'الاشتراكات',
      items: [
        { href: '/admin/subscriptions', label: 'الاشتراكات', icon: I.crown },
        { href: '/admin/subscriptions/plans', label: 'الباقات', icon: I.shield },
      ],
    },
    {
      title: 'المستخدمين',
      items: [
        { href: '/admin/users', label: 'المستخدمين', icon: I.users },
        { href: '/admin/points', label: 'النقاط', icon: I.gift },
        { href: '/admin/merchants', label: 'طلبات التجار', icon: I.store },
      ],
    },
    {
      title: 'النظام',
      items: [
        { href: '/admin/studio', label: 'الاستوديو', icon: I.sparkles },
        { href: '/admin/settings/notifications', label: 'الإشعارات', icon: I.bell },
        { href: '/admin/security', label: 'الأمان', icon: I.shield },
        { href: '/admin/audit', label: 'سجل العمليات', icon: I.log },
      ],
    },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  // ─── Breadcrumbs من الـ pathname ───
  const breadcrumbs = (() => {
    const parts = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean)
    if (parts.length === 0) return [{ label: 'نظرة عامة', href: '/admin' }]
    const crumbs = [{ label: 'لوحة التحكم', href: '/admin' }]
    let acc = '/admin'
    for (const p of parts) {
      acc += '/' + p
      crumbs.push({ label: p, href: acc })
    }
    return crumbs
  })()

  return (
    <div className="adm" data-mobile-open={mobileOpen} data-collapsed={collapsed}>
      <div className="adm__overlay" onClick={() => setMobileOpen(false)} aria-hidden />

      {/* ═══ SIDEBAR ═══ */}
      <aside className="adm__sidebar">
        {/* Logo */}
        <div className="adm__sidebar-head">
          <Link href="/admin" className="adm__logo">
            <EahLogo size="sm" variant="compact" href="/admin" />
          </Link>
          <button
            type="button"
            className="adm__collapse"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'فتح القائمة' : 'إغلاق القائمة'}
            title={collapsed ? 'فتح' : 'إغلاق'}
          >
            {collapsed ? I.chevronRight : I.chevronLeft}
          </button>
          <button
            type="button"
            className="adm__mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="إغلاق"
          >
            {I.close}
          </button>
        </div>

        {/* Nav */}
        <nav className="adm__nav">
          {sections.map((section) => (
            <div key={section.title} className="adm__section">
              <div className="adm__section-title">{section.title}</div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="adm__link"
                  data-active={isActive(item.href)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="adm__link-icon" aria-hidden>{item.icon}</span>
                  <span className="adm__link-label">{item.label}</span>
                  {item.liveBadge && <PendingBadge initial={pendingChanges ?? 0} />}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="adm__link-badge">{item.badge}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="adm__bottom">
          <Link href="/" target="_blank" className="adm__link adm__link--ghost" title="الموقع">
            <span className="adm__link-icon" aria-hidden>{I.compass}</span>
            <span className="adm__link-label">الموقع</span>
            <span className="adm__link-ext" aria-hidden>{I.external}</span>
          </Link>
          <form action="/admin/logout" method="post" className="adm__logout-form">
            <button type="submit" className="adm__link adm__link--danger" title="خروج">
              <span className="adm__link-icon" aria-hidden>{I.logout}</span>
              <span className="adm__link-label">خروج</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ═══ MAIN AREA ═══ */}
      <div className="adm__content">
        {/* Top Bar */}
        <header className="adm__topbar">
          <button
            type="button"
            className="adm__menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="القائمة"
          >
            {I.menu}
          </button>

          <nav className="adm__crumbs" aria-label="breadcrumbs">
            {breadcrumbs.map((c, i) => (
              <span key={i} className="adm__crumb-wrap">
                {i > 0 && <span className="adm__crumb-sep">/</span>}
                {i === breadcrumbs.length - 1 ? (
                  <span className="adm__crumb adm__crumb--current">{c.label}</span>
                ) : (
                  <Link href={c.href} className="adm__crumb">{c.label}</Link>
                )}
              </span>
            ))}
          </nav>

          <div className="adm__topbar-actions">
            <Link href="/admin/search" className="adm__search" aria-label="بحث">
              {I.search}
              <span className="adm__search-text">بحث...</span>
              <kbd className="adm__search-kbd">⌘K</kbd>
            </Link>
            <Link href="/admin/audit" className="adm__icon-btn" aria-label="السجل" title="سجل العمليات">
              {I.log}
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="adm__main">
          {children}
        </main>
      </div>
    </div>
  )
}
