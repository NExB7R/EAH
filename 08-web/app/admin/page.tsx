import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'لوحة التحكم | EAH Admin' }

export default async function AdminHomePage() {
  const supabase = await createClient()

  const [
    { count: totalBiz },
    { count: publishedBiz },
    { count: featuredBiz },
    { count: totalUsers },
    { count: totalOffers },
    { count: pendingChanges },
  ] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('offers').select('*', { count: 'exact', head: true }),
    supabase.from('business_change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'الأنشطة', value: totalBiz ?? 0, icon: '🏪', href: '/admin/businesses', color: 'var(--eah-purple-2)' },
    { label: 'منشور', value: publishedBiz ?? 0, icon: '📢', href: '/admin/businesses', color: 'var(--eah-green)' },
    { label: 'مميز', value: featuredBiz ?? 0, icon: '⭐', href: '/admin/businesses', color: 'var(--eah-gold)' },
    { label: 'مستخدمين', value: totalUsers ?? 0, icon: '👥', href: '/admin/users', color: 'var(--eah-purple-3)' },
    { label: 'عروض', value: totalOffers ?? 0, icon: '🔥', href: '/admin/offers', color: '#FB923C' },
    { label: 'طلبات تعديل', value: pendingChanges ?? 0, icon: '📝', href: '/admin/change-requests', color: 'var(--eah-gold)' },
  ]

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">EAH CONTROL CENTER</span>
          <h1 className="admin-header__title">👑 مرحباً بك في لوحة التحكم</h1>
          <p className="admin-header__subtitle">
            كل اللي محتاجه للتحكم في المنصة من مكان واحد
          </p>
        </div>
        <div className="admin-header__actions">
          <Link href="/admin/businesses/new" className="admin-btn admin-btn--primary">
            ➕ إضافة مكان
          </Link>
        </div>
      </div>

      <div className="admin-grid admin-grid--cards">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="admin-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--eah-surface-2)', border: '1px solid var(--eah-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--eah-font-body)', fontSize: '0.72rem', color: 'var(--eah-text-3)', fontWeight: 700 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: 'var(--eah-font-display)', fontSize: '1.8rem', fontWeight: 900, color: s.color, lineHeight: 1.1 }}>
                  {s.value}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
