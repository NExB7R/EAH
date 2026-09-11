import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AccountControls from '@/components/account-controls'

const ADMIN_REAUTH_WINDOW_SECONDS = 5 * 60

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const claims = claimsData?.claims

  if (claimsError || !claims) redirect('/admin/verify')

  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) redirect('/auth')

  const { data: roleRow, error: roleError } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
  if (roleError) throw new Error(`Unable to read admin role: ${roleError.message}`)
  if (roleRow?.role !== 'super_admin') redirect('/?admin=denied')

  const authTime = Number((claims as Record<string, unknown>).auth_time ?? 0)
  const recentlyAuthenticated = authTime > 0 && Math.floor(Date.now() / 1000) - authTime <= ADMIN_REAUTH_WINDOW_SECONDS
  if (!recentlyAuthenticated) redirect('/admin/verify')

  const { count: pendingChanges } = await supabase.from('business_change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  const links = [
    ['/admin', 'نظرة عامة'],
    ['/admin/analytics', '📊 الإحصائيات والتحليلات'],
    ['/admin/ads', '📣 إدارة الإعلانات'],
    ['/admin/change-requests', `مراجعة تعديلات${pendingChanges ? ` (${pendingChanges})` : ''}`],
    ['/admin/businesses', 'الأنشطة'],
    ['/admin/merchants', 'طلبات أصحاب الأنشطة'],
    ['/admin/users', 'المستخدمين والأرقام'],
    ['/admin/reviews', 'التقييمات والتعليقات'],
    ['/admin/offers', 'العروض'],
    ['/admin/studio', 'استوديو التصميم'],
    ['/admin/audit', 'سجل العمليات'],
    ['/admin/security', 'الأمان والتشفير'],
  ] as const

  return (
    <div className="eah-admin-shell">
      <aside className="eah-admin-sidebar">
        <Link href="/admin" className="eah-admin-brand">EAH <span>B7R CONTROL</span></Link>
        <nav aria-label="إدارة EAH">{links.map(([href, label]) => <Link key={href} href={href} className="eah-admin-nav-link">{label}</Link>)}</nav>
        <div className="eah-admin-side-bottom" style={{ display: 'grid', gap: 10 }}>
          <Link href="/" className="eah-admin-nav-link">← الموقع</Link>
          <span className="eah-admin-role">EAH • Super Admin</span>
          <AccountControls />
        </div>
      </aside>
      <main className="eah-admin-main">{children}</main>
    </div>
  )
}
