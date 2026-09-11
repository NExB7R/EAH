import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

async function countTable(supabase: Awaited<ReturnType<typeof createClient>>, table: string) {
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
  return count ?? 0
}

export default async function AdminHomePage() {
  const supabase = await createClient()
  const [businesses, offers, reviews, users, pendingChanges] = await Promise.all([
    countTable(supabase, 'businesses'),
    countTable(supabase, 'offers'),
    countTable(supabase, 'business_reviews'),
    countTable(supabase, 'profiles'),
    (async () => {
      const { count } = await supabase.from('business_change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      return count ?? 0
    })(),
  ])

  return (
    <section>
      <header className="eah-admin-header">
        <div>
          <span className="eah-admin-kicker">EAH CONTROL CENTER • SUPER ADMIN</span>
          <h1>لوحة التحكم</h1>
          <p>المركز الكامل لإدارة الأنشطة، المستخدمين، المراجعات، والنشر.</p>
        </div>
        <Link href="/admin/change-requests" className="eah-admin-primary">المراجعات ({pendingChanges}) →</Link>
      </header>

      <div className="eah-admin-stat-grid">
        {[
          ['الأنشطة', businesses, '/admin/businesses'],
          ['العروض', offers, '/admin/offers'],
          ['التقييمات', reviews, '/admin/reviews'],
          ['المستخدمين', users, '/admin/users'],
          ['تعديلات تنتظر الموافقة', pendingChanges, '/admin/change-requests'],
        ].map(([label, value, href]) => (
          <Link href={href as string} key={label as string} className="eah-admin-stat-card">
            <span>{label}</span>
            <strong>{value}</strong>
            <small>فتح القسم ←</small>
          </Link>
        ))}
      </div>

      <div className="eah-admin-command-grid">
        <Link href="/admin/change-requests" className="eah-admin-command-card"><strong>🛡️ بوابة النشر</strong><span>كل تعديل من صاحب النشاط يقف هنا قبل وصوله للصفحة العامة.</span></Link>
        <Link href="/admin/businesses" className="eah-admin-command-card"><strong>⚡ إدارة الأنشطة</strong><span>البيانات، أصحاب الأنشطة، الصلاحيات، وصفحات الأنشطة.</span></Link>
        <Link href="/admin/users" className="eah-admin-command-card"><strong>👤 المستخدمون والأرقام</strong><span>إدارة العملاء وأصحاب الأنشطة وربط الملكية.</span></Link>
        <Link href="/admin/studio" className="eah-admin-command-card"><strong>🎨 استوديو التصميم</strong><span>تحكم بصري في المنصة وصفحات الأنشطة.</span></Link>
        <Link href="/admin/reviews" className="eah-admin-command-card"><strong>🛡️ التقييمات والموديريشن</strong><span>إدارة التقييمات والتعليقات والحالات المعلقة.</span></Link>
        <Link href="/admin/audit" className="eah-admin-command-card"><strong>🧾 سجل العمليات</strong><span>تتبع من نفّذ كل عملية ومتى.</span></Link>
      </div>
    </section>
  )
}
