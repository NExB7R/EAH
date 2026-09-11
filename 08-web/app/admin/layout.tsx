import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims as Record<string, unknown> | undefined
  const userId = claims?.sub as string | undefined

  if (!userId) redirect('/admin/login')

  const jwtRole = claims?.user_role as string | null | undefined
  const { data: roleRow } = jwtRole
    ? { data: { role: jwtRole } }
    : await supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle()
  const role = roleRow?.role

  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/?admin=denied')
  }

  const links = [
    ['/admin', 'نظرة عامة'],
    ['/admin/businesses', 'الأنشطة'],
    ['/admin/reviews', 'التقييمات والتعليقات'],
    ['/admin/offers', 'العروض'],
    ['/admin/users', 'المستخدمين'],
    ['/admin/studio', 'استوديو التصميم'],
    ['/admin/audit', 'سجل العمليات'],
  ] as const

  return (
    <div className="eah-admin-shell">
      <aside className="eah-admin-sidebar">
        <Link href="/admin" className="eah-admin-brand">EAH <span>B7R CONTROL</span></Link>
        <nav aria-label="إدارة EAH">
          {links.map(([href, label]) => <Link key={href} href={href} className="eah-admin-nav-link">{label}</Link>)}
        </nav>
        <div className="eah-admin-side-bottom">
          <Link href="/" className="eah-admin-nav-link">← الموقع</Link>
          <span className="eah-admin-role">{role === 'super_admin' ? 'B7R • Super Admin' : 'B7R • Admin'}</span>
        </div>
      </aside>
      <main className="eah-admin-main">{children}</main>
    </div>
  )
}
