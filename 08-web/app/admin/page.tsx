import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { IcBuilding, IcStore, IcStar, IcUsers, IcTag, IcEdit, IcSave, IcChart, IcMegaphone, IcSparkles, IcCheck, IcChat } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'لوحة التحكم' }

export default async function AdminHomePage() {
  const supabase = await createClient()

  const [
    { count: totalBiz },
    { count: publishedBiz },
    { count: featuredBiz },
    { count: totalUsers },
    { count: totalOffers },
    { count: pendingChanges },
    { count: pendingVerif },
  ] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('offers').select('*', { count: 'exact', head: true }),
    supabase.from('business_change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'الأنشطة', value: totalBiz ?? 0, icon: <IcBuilding />, href: '/admin/businesses', color: 'var(--eah-purple-2)' },
    { label: 'منشور', value: publishedBiz ?? 0, icon: <IcCheck />, href: '/admin/businesses', color: 'var(--eah-purple-soft)' },
    { label: 'مميز', value: featuredBiz ?? 0, icon: <IcStar />, href: '/admin/businesses', color: 'var(--eah-gold)' },
    { label: 'مستخدمين', value: totalUsers ?? 0, icon: <IcUsers />, href: '/admin/users', color: 'var(--eah-purple-3)' },
    { label: 'عروض', value: totalOffers ?? 0, icon: <IcTag />, href: '/admin/offers', color: '#FB923C' },
    { label: 'طلبات تعديل', value: pendingChanges ?? 0, icon: <IcEdit />, href: '/admin/change-requests', color: 'var(--eah-gold)' },
    { label: 'طلبات توثيق', value: pendingVerif ?? 0, icon: <IcSparkles />, href: '/admin/verifications', color: 'var(--eah-purple-soft)' },
  ]

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">غرفة التحكم</span>
          <h1 className="admin-header__title">مرحباً بك في لوحة التحكم</h1>
          <p className="admin-header__subtitle">
            كل اللي محتاجه للتحكم في المنصة من مكان واحد
          </p>
        </div>
        <div className="admin-header__actions">
          <Link href="/admin/businesses/new" className="admin-btn admin-btn--primary">
            إضافة مكان
          </Link>
        </div>
      </div>

      <div className="admin-grid admin-grid--cards">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="admin-kpi">
            <span className="admin-kpi__icon" style={{ color: s.color }} aria-hidden>
              {s.icon}
            </span>
            <div className="admin-kpi__body">
              <div className="admin-kpi__label">{s.label}</div>
              <div className="admin-kpi__value" style={{ color: s.color }}>{s.value}</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
