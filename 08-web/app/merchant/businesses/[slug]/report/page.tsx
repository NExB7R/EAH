import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

function n(v: unknown) { return typeof v === 'number' ? v : Number(v ?? 0) }

type Report = { business: any; period_days: number; views: number; unique_visitors: number; live_now: number; daily: any[]; referrers: any[]; devices: any[]; ads: any }

export default async function MerchantBusinessReport({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')
  const { data: business } = await supabase.from('businesses').select('id,name,slug,owner_profile_id,city,area').eq('slug', slug).eq('owner_profile_id', userData.user.id).maybeSingle()
  if (!business) redirect('/merchant')
  const { data: report, error } = await supabase.rpc('merchant_business_report', { p_business_id: business.id, p_days: 7 })
  if (error) throw new Error(error.message)
  const r = report as Report
  return (
    <main className="container page-pad merchant-report">
      <div className="report-toolbar no-print"><Link className="pill" href="/merchant">← لوحة النشاط</Link><button className="pill" onClick={() => undefined}>🖨️ اطبع التقرير من المتصفح</button></div>
      <header style={{ marginBottom: 24 }}>
        <div className="eyebrow">EAH • BUSINESS REPORT</div>
        <h1 className="page-title">تقرير {business.name}</h1>
        <p className="lead">تقرير أسبوعي مختصر قابل للطباعة — زيارات، زوار، مصادر، أجهزة، وإعلانات.</p>
      </header>
      <section className="eah-admin-stat-grid">
        <div className="eah-admin-stat-card"><span>زيارات آخر 7 أيام</span><strong>{n(r.views)}</strong><small>Page views</small></div>
        <div className="eah-admin-stat-card"><span>زوار فريدون</span><strong>{n(r.unique_visitors)}</strong><small>Unique visitors</small></div>
        <div className="eah-admin-stat-card"><span>Live الآن</span><strong>{n(r.live_now)}</strong><small>آخر دقيقتين</small></div>
        <div className="eah-admin-stat-card"><span>CTR الإعلانات</span><strong>{n(r.ads?.ctr)}%</strong><small>{n(r.ads?.clicks)} نقرة / {n(r.ads?.impressions)} ظهور</small></div>
      </section>
      <section style={{ display: 'grid', gap: 16, marginTop: 18 }}>
        <div className="card" style={{ padding: 20 }}><h2>اليوم بيوم</h2><div style={{ display: 'grid', gap: 8, marginTop: 12 }}>{(r.daily ?? []).map((x: any) => <div key={String(x.day_key)} className="eah-admin-business-card"><span>{new Date(String(x.day_key)).toLocaleDateString('ar-EG')}</span><strong>{n(x.views)} زيارة • {n(x.unique_visitors)} زائر</strong></div>)}</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}><h2>مصادر الزيارة</h2>{(r.referrers ?? []).map((x: any) => <div key={x.referrer} style={{ display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border)' }}><span>{x.referrer}</span><strong>{n(x.views)}</strong></div>)}</div>
          <div className="card" style={{ padding: 20 }}><h2>الأجهزة</h2>{(r.devices ?? []).map((x: any) => <div key={x.device} style={{ display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border)' }}><span>{x.device}</span><strong>{n(x.views)}</strong></div>)}</div>
        </div>
      </section>
      <div className="card" style={{ marginTop: 18, padding: 18 }}><strong>قراءة تجارية:</strong><div style={{ opacity:.8, marginTop:6 }}>الزيارات والزوار الفريدين هنا من نفس مصدر التحليلات المركزي. بيانات الإعلانات منفصلة عشان نقدر نحسب قيمة الحملة لاحقًا بدون خلط بين زيارات النشاط ومرات ظهور الإعلان.</div></div>
      <style>{`@media print{.no-print{display:none!important}.merchant-report{padding:20px!important;color:#111;background:#fff}.merchant-report .card,.merchant-report .eah-admin-stat-card{box-shadow:none;border:1px solid #ddd;background:#fff}.merchant-report .page-title{color:#111}.merchant-report .lead,.merchant-report .eyebrow,.merchant-report .eah-admin-stat-card span,.merchant-report .eah-admin-stat-card small,.merchant-report .eah-admin-business-sub{color:#555}body{background:#fff!important}}`}</style>
    </main>
  )
}
