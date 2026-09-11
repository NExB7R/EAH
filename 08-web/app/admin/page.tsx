import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

async function countTable(supabase: Awaited<ReturnType<typeof createClient>>, table: string) {
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
  return count ?? 0
}

export default async function AdminHomePage() {
  const supabase = await createClient()
  const [businesses, offers, reviews, users] = await Promise.all([
    countTable(supabase, 'businesses'),
    countTable(supabase, 'offers'),
    countTable(supabase, 'business_reviews'),
    countTable(supabase, 'profiles'),
  ])

  return (
    <section>
      <header className="eah-admin-header">
        <div>
          <span className="eah-admin-kicker">EAH CONTROL CENTER</span>
          <h1>لوحة التحكم</h1>
          <p>كل حاجة في إيدك — من إدارة البيانات لحد تصميم الصفحات.</p>
        </div>
        <Link href="/admin/businesses" className="eah-admin-primary">إدارة الأنشطة →</Link>
      </header>

      <div className="eah-admin-stat-grid">
        {[
          ['الأنشطة', businesses, '/admin/businesses'],
          ['العروض', offers, '/admin/offers'],
          ['التقييمات', reviews, '/admin/reviews'],
          ['المستخدمين', users, '/admin/users'],
        ].map(([label, value, href]) => (
          <Link href={href as string} key={label as string} className="eah-admin-stat-card">
            <span>{label}</span>
            <strong>{value}</strong>
            <small>فتح القسم ←</small>
          </Link>
        ))}
      </div>

      <div className="eah-admin-command-grid">
        <Link href="/admin/businesses" className="eah-admin-command-card"><strong>⚡ تعديل سريع</strong><span>الوصول لأي مطعم أو صيدلية أو ماركت في ثواني.</span></Link>
        <Link href="/admin/studio" className="eah-admin-command-card"><strong>🎨 استوديو التصميم</strong><span>تحكم بصري في المنصة وصفحات الأنشطة بدون لمس الكود.</span></Link>
        <Link href="/admin/reviews" className="eah-admin-command-card"><strong>🛡️ المراجعة والموديريشن</strong><span>إدارة التقييمات والتعليقات والحالات المعلقة.</span></Link>
        <Link href="/admin/audit" className="eah-admin-command-card"><strong>🧾 سجل العمليات</strong><span>نعرف مين عدّل إيه وإمتى.</span></Link>
      </div>
    </section>
  )
}
