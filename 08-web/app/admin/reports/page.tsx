import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'التقارير الشهرية' }

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  // كل الأشهر اللي فيها تقارير
  const { data: months } = await supabase
    .from('business_monthly_reports')
    .select('month_key')
    .order('month_key', { ascending: false })

  const uniqueMonths = Array.from(new Set((months ?? []).map((m) => m.month_key)))
  const selectedMonth = month ?? uniqueMonths[0] ?? new Date().toISOString().slice(0, 7)

  // التقارير للشهر المختار
  const { data: reports } = await supabase
    .from('business_monthly_reports')
    .select(`
      id, month_key, generated_at, data,
      business:businesses!business_monthly_reports_business_id_fkey(id, name, slug)
    `)
    .eq('month_key', selectedMonth)

  // كل الأنشطة (لو مفيش تقرير)
  const { data: allBusinesses } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('is_published', true)
    .order('name')

  const reportMap = new Map<string, any>()
  ;(reports ?? []).forEach((r: any) => reportMap.set(r.business?.id, r))

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">📊 التقارير</span>
          <h1 className="admin-header__title">التقارير الشهرية</h1>
          <p className="admin-header__subtitle">كل تقارير الأنشطة في مكان واحد</p>
        </div>
        <div className="admin-header__actions">
          <a href={`/api/admin/export?type=reports&month=${selectedMonth}`} className="admin-btn admin-btn--gold">📥 تحميل CSV</a>
        </div>
      </div>

      {uniqueMonths.length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {uniqueMonths.map((m) => (
            <Link
              key={m}
              href={`?month=${m}`}
              className="admin-btn"
              style={{
                background: m === selectedMonth ? 'linear-gradient(135deg, #A855F7, #6B21FF)' : undefined,
                color: m === selectedMonth ? '#fff' : undefined,
              }}
            >
              {m}
            </Link>
          ))}
        </div>
      )}

      <div style={{ padding: '0 20px 40px' }}>
        {uniqueMonths.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, borderRadius: 20, background: 'rgba(20,14,34,0.4)', border: '1px dashed rgba(168,85,247,0.25)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
            <h2 style={{ margin: '0 0 8px', color: '#F4F2FA', fontSize: '1.2rem' }}>لسه مفيش تقارير</h2>
            <p style={{ margin: '0 0 20px', color: '#A29DB5', fontSize: '0.9rem' }}>
              التقارير بتتولد تلقائي يوم 2 من كل شهر — أو يدوياً
            </p>
            <button id="gen-reports-btn" className="admin-btn">📊 ولّد تقارير الشهر</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {(allBusinesses ?? []).map((b) => {
              const r = reportMap.get(b.id)
              const d = r?.data
              return (
                <div key={b.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto auto auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: 14,
                  background: 'linear-gradient(180deg, rgba(20,14,34,0.5), rgba(10,7,20,0.3))',
                  border: '1px solid rgba(168,85,247,0.15)',
                }}>
                  <div>
                    <strong style={{ color: '#F4F2FA', fontSize: '0.95rem' }}>{b.name}</strong>
                    <span style={{ display: 'block', color: '#7B7490', fontSize: '0.72rem' }}>/{b.slug}</span>
                  </div>
                  {d ? (
                    <>
                      <span style={{ color: '#C4B5FD', fontSize: '0.82rem', fontWeight: 800 }}>👁 {d.views}</span>
                      <span style={{ color: '#6EE7B7', fontSize: '0.82rem', fontWeight: 800 }}>🛒 {d.orders}</span>
                      <span style={{ color: '#F5D9A7', fontSize: '0.82rem', fontWeight: 800 }}>⭐ {d.avg_rating?.toFixed(1) ?? '0.0'}</span>
                      <Link href={`/merchant/businesses/${b.slug}/reports?month=${selectedMonth}`} className="admin-btn">عرض</Link>
                      <Link href={`/admin/businesses/${b.slug}/edit`} className="admin-btn admin-btn--ghost">تعديل</Link>
                    </>
                  ) : (
                    <>
                      <span style={{ color: '#7B7490', fontSize: '0.82rem', gridColumn: 'span 3' }}>— مفيش تقرير لسه —</span>
                      <button className="admin-btn">ولّد</button>
                      <Link href={`/admin/businesses/${b.slug}/edit`} className="admin-btn admin-btn--ghost">تعديل</Link>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
