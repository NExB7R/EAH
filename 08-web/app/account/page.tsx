import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'حسابي | EAH' }

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')

  const user = userData.user

  const [{ data: profile }, { data: roleRow }, { count: favCount }, { count: reviewCount }, { count: notifCount }] = await Promise.all([
    supabase.from('profiles').select('display_name,phone,phone_verified_at,trust_score,created_at,banned_until,ban_reason').eq('id', user.id).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
    supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('business_reviews').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).is('read_at', null),
  ])

  const role = roleRow?.role ?? 'customer'
  const isBanned = profile?.banned_until && new Date(profile.banned_until) > new Date()

  const initial = (profile?.display_name ?? 'ز').charAt(0).toUpperCase()

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="mpage">
        <div className="mpage__head">
          <div>
            <span className="mpage__kicker">MY ACCOUNT</span>
            <h1 className="mpage__title">👤 حسابي</h1>
            <p className="mpage__sub">
              مرحبًا {profile?.display_name ?? 'مستخدم'} 👋
            </p>
          </div>
          <form action="/auth/logout" method="post">
            <button type="submit" className="admin-btn admin-btn--ghost">
              🚪 تسجيل خروج
            </button>
          </form>
        </div>

        {isBanned && (
          <div style={{
            padding: '16px 20px',
            borderRadius: 16,
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid rgba(248, 113, 113, 0.35)',
            marginBottom: 20,
          }}>
            <strong style={{ color: 'var(--eah-red)', display: 'block', marginBottom: 6 }}>
              🚫 حسابك محظور مؤقتًا
            </strong>
            <p style={{ margin: 0, color: 'var(--eah-text-2)', fontSize: '0.85rem' }}>
              السبب: {profile?.ban_reason ?? 'غير محدد'}
            </p>
            <p style={{ margin: '4px 0 0', color: 'var(--eah-text-3)', fontSize: '0.78rem' }}>
              ينتهي في: {new Date(profile!.banned_until!).toLocaleDateString('ar-EG')}
            </p>
          </div>
        )}

        <div className="mstats" style={{ marginBottom: 24 }}>
          <div className="mstat">
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: isBanned ? 'linear-gradient(135deg, #EF4444, #991B1B)' : 'var(--eah-gradient-purple)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--eah-font-body)', fontSize: '1.5rem', fontWeight: 900,
            }}>
              {initial}
            </div>
            <span className="mstat__value" style={{ fontSize: '1rem', color: 'var(--eah-text)' }}>
              {profile?.display_name ?? 'مستخدم'}
            </span>
            <span className="mstat__label">{profile?.phone ?? user.email}</span>
          </div>

          <div className="mstat">
            <span className="mstat__emoji">🎭</span>
            <span className="mstat__value" style={{ color: 'var(--eah-purple-2)' }}>{role}</span>
            <span className="mstat__label">نوع الحساب</span>
          </div>

          <div className="mstat">
            <span className="mstat__emoji">⭐</span>
            <span className="mstat__value" style={{ color: 'var(--eah-gold)' }}>
              {profile?.trust_score ?? 0}
            </span>
            <span className="mstat__label">نقاط الثقة</span>
          </div>

          <div className="mstat">
            <span className="mstat__emoji">❤️</span>
            <span className="mstat__value" style={{ color: '#FB923C' }}>{favCount ?? 0}</span>
            <span className="mstat__label">مفضلة</span>
          </div>

          <div className="mstat">
            <span className="mstat__emoji">✍️</span>
            <span className="mstat__value" style={{ color: 'var(--eah-green)' }}>{reviewCount ?? 0}</span>
            <span className="mstat__label">تقييمات</span>
          </div>

          <div className="mstat">
            <span className="mstat__emoji">🔔</span>
            <span className="mstat__value" style={{ color: 'var(--eah-gold)' }}>{notifCount ?? 0}</span>
            <span className="mstat__label">إشعارات</span>
          </div>
        </div>

        <section style={{ padding: 20, borderRadius: 20, background: 'var(--eah-surface)', border: '1px solid var(--eah-border)' }}>
          <h2 style={{ fontFamily: 'var(--eah-font-display)', fontSize: '1.1rem', fontWeight: 900, color: 'var(--eah-text)', margin: '0 0 16px' }}>
            إجراءات سريعة
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Link href="/explore" className="admin-btn">🔍 اكتشف الأماكن</Link>
            <Link href="/recommend" className="admin-btn">✨ نفسك في ايه؟</Link>
            <Link href="/offers" className="admin-btn">🔥 العروض</Link>
            <Link href="/auth/change-password" className="admin-btn">🔒 تغيير كلمة السر</Link>
            {role === 'merchant' && (
              <Link href="/merchant" className="admin-btn admin-btn--primary">🏪 لوحة النشاط</Link>
            )}
            {['admin', 'super_admin'].includes(role) && (
              <Link href="/admin" className="admin-btn admin-btn--primary">👑 لوحة التحكم</Link>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
