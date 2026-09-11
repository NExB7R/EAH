import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

async function countTable(supabase: Awaited<ReturnType<typeof createClient>>, table: string) {
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
  return count ?? 0
}

function n(value: unknown) {
  return typeof value === 'number' ? value : Number(value ?? 0)
}

export default async function AdminHomePage() {
  const supabase = await createClient()
  const [businesses, offers, reviews, users, pendingChanges, analytics, topBusinesses] = await Promise.all([
    countTable(supabase, 'businesses'),
    countTable(supabase, 'offers'),
    countTable(supabase, 'business_reviews'),
    countTable(supabase, 'profiles'),
    (async () => {
      const { count } = await supabase.from('business_change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      return count ?? 0
    })(),
    supabase.rpc('admin_analytics_summary'),
    supabase.rpc('admin_top_businesses_analytics', { p_days: 7 }),
  ])

  const liveSummary = analytics.data ?? {}
  const topRows = (topBusinesses.data ?? []).slice(0, 5)

  return (
    <section>
      <header className="eah-admin-header">
        <div>
          <span className="eah-admin-kicker">EAH CONTROL CENTER • SUPER ADMIN</span>
          <h1>لوحة التحكم</h1>
          <p>المركز الكامل لإدارة الأنشطة، المستخدمين، المراجعات، النشر، والتحليلات.</p>
        </div>
        <div className="eah-admin-actions"><Link href="/admin/analytics" className="eah-admin-primary">📊 كل الإحصائيات</Link><Link href="/admin/change-requests" className="eah-admin-btn">المراجعات ({pendingChanges})</Link></div>
      </header>

      <div className="eah-admin-stat-grid">
        {[
          ['الأنشطة', businesses, '/admin/businesses'],
          ['العروض', offers, '/admin/offers'],
          ['التقييمات', reviews, '/admin/reviews'],
          ['المستخدمين', users, '/admin/users'],
          ['تعديلات تنتظر الموافقة', pendingChanges, '/admin/change-requests'],
          ['زوار الآن', n(liveSummary.live_visitors), '/admin/analytics'],
          ['زيارات اليوم', n(liveSummary.views_today), '/admin/analytics'],
          ['زوار فريدون اليوم', n(liveSummary.unique_visitors_today), '/admin/analytics'],
        ].map(([label, value, href]) => (
          <Link href={href as string} key={label as string} className="eah-admin-stat-card">
            <span>{label}</span>
            <strong>{value}</strong>
            <small>فتح القسم ←</small>
          </Link>
        ))}
      </div>

      <div className="card" style={{ padding: 22, marginTop: 18 }}>
        <div className="section-head"><div><h2>أكثر الأنشطة زيارة</h2><span>آخر 7 أيام • الزيارات / الزوار الفريدين / Live الآن</span></div><Link href="/admin/analytics" className="pill">التفاصيل →</Link></div>
        <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
          {topRows.length ? topRows.map((row: any, index: number) => (
            <div key={row.business_id} className="eah-admin-business-card" style={{ padding: 12 }}>
              <div><strong>#{index + 1} {row.business_name}</strong><div className="eah-admin-business-sub">{n(row.views)} زيارة • {n(row.unique_visitors)} زائر فريد • {n(row.live_visitors)} الآن</div></div>
              {n(row.live_visitors) > 0 && <span className="eah-admin-badge live">{n(row.live_visitors)} Live</span>}
            </div>
          )) : <div className="eah-admin-business-sub">لسه مفيش بيانات زيارات. أول زيارات للموقع هتبدأ تبني الإحصائيات.</div>}
        </div>
      </div>

      <div className="eah-admin-command-grid">
        <Link href="/admin/change-requests" className="eah-admin-command-card"><strong>🛡️ بوابة النشر</strong><span>كل تعديل من صاحب النشاط يقف هنا قبل وصوله للصفحة العامة.</span></Link>
        <Link href="/admin/businesses" className="eah-admin-command-card"><strong>⚡ إدارة الأنشطة</strong><span>البيانات، أصحاب الأنشطة، الصلاحيات، وصفحات الأنشطة.</span></Link>
        <Link href="/admin/users" className="eah-admin-command-card"><strong>👤 المستخدمون والأرقام</strong><span>إدارة العملاء وأصحاب الأنشطة وربط الملكية.</span></Link>
        <Link href="/admin/analytics" className="eah-admin-command-card"><strong>📈 التحليلات</strong><span>Live، يومي، أسبوعي، شهري، وترتيب كل نشاط وكل صفحة.</span></Link>
        <Link href="/admin/studio" className="eah-admin-command-card"><strong>🎨 استوديو التصميم</strong><span>تحكم بصري في المنصة وصفحات الأنشطة.</span></Link>
        <Link href="/admin/audit" className="eah-admin-command-card"><strong>🧾 سجل العمليات</strong><span>تتبع من نفّذ كل عملية ومتى.</span></Link>
      </div>
    </section>
  )
}
