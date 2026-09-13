import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import LineChart from '@/components/charts/line-chart'
import BarChart from '@/components/charts/bar-chart'
import '@/components/charts/charts.css'
import './analytics.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'التحليلات | EAH Admin' }

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  // ─── آخر 14 يوم زيارات ───
  const since = new Date(Date.now() - 13 * 86400000).toISOString().slice(0, 10)
  const { data: visits } = await supabase
    .from('daily_visits')
    .select('visit_date')
    .gte('visit_date', since)

  const visitMap = new Map<string, number>()
  ;(visits ?? []).forEach(v => {
    visitMap.set(v.visit_date, (visitMap.get(v.visit_date) ?? 0) + 1)
  })
  const visitsData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
    return { label, value: visitMap.get(key) ?? 0 }
  })

  // ─── كشوف الأرقام آخر 14 يوم ───
  const { data: reveals } = await supabase
    .from('contact_reveals')
    .select('method_type, created_at')
    .gte('created_at', new Date(Date.now() - 13 * 86400000).toISOString())

  const revealMap = new Map<string, number>()
  ;(reveals ?? []).forEach(r => {
    const day = r.created_at.slice(0, 10)
    revealMap.set(day, (revealMap.get(day) ?? 0) + 1)
  })
  const revealsData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
    return { label, value: revealMap.get(key) ?? 0 }
  })

  // ─── توزيع حسب النوع ───
  const { data: bizTypes } = await supabase
    .from('businesses')
    .select('business_type')
    .eq('is_published', true)

  const typeMap: Record<string, number> = {}
  ;(bizTypes ?? []).forEach(b => {
    typeMap[b.business_type] = (typeMap[b.business_type] ?? 0) + 1
  })
  const typeLabels: Record<string, string> = {
    restaurant: 'مطاعم', pharmacy: 'صيدليات', delivery_office: 'توصيل',
  }
  const typeColors: Record<string, string> = {
    restaurant: '#F97316', pharmacy: '#4ADE80', delivery_office: '#A855F7',
  }
  const typeData = Object.entries(typeMap).map(([k, v]) => ({
    label: typeLabels[k] ?? k,
    value: v,
    color: typeColors[k] ?? '#A855F7',
  }))

  // ─── إحصائيات عامة ───
  const [{ count: totalUsers }, { count: totalBiz }, { count: totalReviews }, { count: totalReferrals }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('business_reviews').select('*', { count: 'exact', head: true }),
    supabase.from('referrals').select('*', { count: 'exact', head: true }),
  ])

  return (
    <section className="an">
      <header className="an__hero">
        <span className="an__kicker">ANALYTICS</span>
        <h1 className="an__title">📊 التحليلات</h1>
        <p className="an__sub">نظرة شاملة على أداء المنصة</p>
      </header>

      <div className="an__kpis">
        <div className="an__kpi"><span className="an__kpi-emoji">👥</span><span className="an__kpi-val">{totalUsers ?? 0}</span><span className="an__kpi-label">مستخدم</span></div>
        <div className="an__kpi"><span className="an__kpi-emoji">🏪</span><span className="an__kpi-val">{totalBiz ?? 0}</span><span className="an__kpi-label">نشاط</span></div>
        <div className="an__kpi"><span className="an__kpi-emoji">✍️</span><span className="an__kpi-val">{totalReviews ?? 0}</span><span className="an__kpi-label">تقييم</span></div>
        <div className="an__kpi"><span className="an__kpi-emoji">🎁</span><span className="an__kpi-val">{totalReferrals ?? 0}</span><span className="an__kpi-label">إحالة</span></div>
      </div>

      <div className="an__charts">
        <div className="an__card">
          <LineChart data={visitsData} color="#A855F7" label="👥 الزيارات اليومية (14 يوم)" />
        </div>
        <div className="an__card">
          <LineChart data={revealsData} color="#4ADE80" label="📞 كشوف الأرقام (14 يوم)" />
        </div>
        <div className="an__card">
          <BarChart data={typeData} label="🏪 الأنشطة حسب النوع" />
        </div>
      </div>

      <div className="an__export">
        <h3 className="an__export-title">📥 تصدير البيانات</h3>
        <p className="an__export-sub">حمّل البيانات كـ CSV لتحليلها في Excel</p>
        <div className="an__export-buttons">
          <a href="/api/admin/export?type=businesses" className="an__export-btn">🏪 الأنشطة</a>
          <a href="/api/admin/export?type=reviews" className="an__export-btn">✍️ التقييمات</a>
          <a href="/api/admin/export?type=reveals" className="an__export-btn">📞 كشوف الأرقام</a>
          <a href="/api/admin/export?type=users" className="an__export-btn">👥 المستخدمون</a>
          <a href="/api/admin/export?type=visits" className="an__export-btn">📅 الزيارات</a>
          <a href="/api/admin/export?type=referrals" className="an__export-btn">🎁 الإحالات</a>
        </div>
      </div>
    </section>
  )
}
