import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

function n(value: unknown) { return typeof value === 'number' ? value : Number(value ?? 0) }

export default async function MerchantDashboard({ searchParams }: { searchParams: Promise<{ submitted?: string; business?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) redirect('/auth')
  const { data: roleRow } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
  if (roleRow?.role !== 'merchant' && roleRow?.role !== 'super_admin') redirect('/?merchant=denied')
  const { data: businesses } = await supabase.from('businesses').select('id,name,slug,description,city,area,is_open,is_published,is_featured,owner_profile_id').eq('owner_profile_id', user.id).order('updated_at', { ascending: false })
  const { data: pending } = await supabase.from('business_change_requests').select('id,business_id,entity_type,operation,status,created_at').eq('submitted_by', user.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(20)
  const analyticsEntries = await Promise.all((businesses ?? []).map(async (business) => { const { data } = await supabase.rpc('merchant_business_analytics', { p_business_id: business.id, p_days: 7 }); return [business.id, data ?? {}] as const }))
  const analyticsMap = new Map(analyticsEntries)
  return (
    <main className="container" style={{ paddingTop: 44 }}>
      <header className="eah-admin-header"><div><span className="eah-admin-kicker">EAH MERCHANT</span><h1>إدارة نشاطك</h1><p>التعديلات بتروح للمراجعة أولًا؛ مفيش تعديل من حسابك بينشر نفسه.</p></div><a href="/" className="eah-admin-btn">← الموقع</a></header>
      {params.submitted === '1' && <div className="card" style={{ padding: 16, marginBottom: 16 }}>✅ اتبعت التعديلات للمراجعة. الصفحة العامة لسه زي ما هي لحد الاعتماد.</div>}
      {(businesses ?? []).length === 0 ? <div className="card" style={{ padding: 20 }}><h2>لسه مفيش نشاط مربوط بالحساب</h2><p className="lead">السوبر أدمين يقدر يربط رقمك بأي مطعم من لوحة التحكم.</p></div> : <div style={{ display: 'grid', gap: 18 }}>{businesses?.map((business) => { const stats: any = analyticsMap.get(business.id) ?? {}; return <article key={business.id} className="eah-admin-business-card" style={{ display: 'grid', gap: 16 }}><div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap' }}><div><div className="eah-admin-business-meta"><span className="eah-admin-business-name">{business.name}</span>{business.is_published && <span className="eah-admin-badge live">منشور</span>}{business.is_open && <span className="eah-admin-badge live">مفتوح</span>}</div><div className="eah-admin-business-sub">{[business.area,business.city].filter(Boolean).join(' • ') || 'الموقع غير محدد'}</div></div><div className="eah-admin-actions"><a className="eah-admin-btn primary" href={`/merchant/businesses/${business.slug}/edit`}>✏️ تعديل للمراجعة</a><a className="eah-admin-btn" href={`/merchant/businesses/${business.slug}/report`}>🖨️ التقرير الأسبوعي</a><a className="eah-admin-btn" href={`/businesses/${business.slug}`}>مشاهدة الصفحة ↗</a></div></div><div className="eah-admin-stat-grid" style={{ marginTop:0 }}><div className="eah-admin-stat-card"><span>زوار الآن</span><strong>{n(stats.live_visitors)}</strong><small>آخر دقيقتين</small></div><div className="eah-admin-stat-card"><span>زيارات اليوم</span><strong>{n(stats.today_views)}</strong><small>اليوم</small></div><div className="eah-admin-stat-card"><span>أمس</span><strong>{n(stats.yesterday_views)}</strong><small>للمقارنة</small></div><div className="eah-admin-stat-card"><span>آخر 7 أيام</span><strong>{n(stats.week_views)}</strong><small>زيارات</small></div><div className="eah-admin-stat-card"><span>آخر 30 يوم</span><strong>{n(stats.month_views)}</strong><small>زيارات</small></div><div className="eah-admin-stat-card"><span>زوار فريدون</span><strong>{n(stats.unique_visitors)}</strong><small>آخر 7 أيام</small></div></div></article> })}</div>}
      {(pending ?? []).length > 0 && <section style={{ marginTop:26 }}><h2>طلباتك قيد المراجعة</h2><div style={{ display:'grid',gap:8 }}>{pending?.map((request) => <div key={request.id} className="card" style={{ padding:14 }}><strong>{request.entity_type}</strong> • {request.operation} • قيد المراجعة</div>)}</div></section>}
    </main>
  )
}
