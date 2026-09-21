import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import ReportView from '@/components/merchant/report-view'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'التقارير الشهرية' }

export default async function ReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ month?: string }>
}) {
  const { slug } = await params
  const { month } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth?next=/merchant/businesses/${slug}/reports`)

  const { data: biz } = await supabase
    .from('businesses')
    .select('id,name,slug,owner_profile_id')
    .eq('slug', slug)
    .maybeSingle()
  if (!biz) notFound()

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', user.id).maybeSingle()

  const isOwner = biz.owner_profile_id === user.id
  const isAdmin = roleRow?.role === 'super_admin'
  if (!isOwner && !isAdmin) redirect('/merchant')

  // كل التقارير المتاحة
  const { data: allReports } = await supabase
    .from('business_monthly_reports')
    .select('id,month_key')
    .eq('business_id', biz.id)
    .order('month_key', { ascending: false })

  const availableMonths = allReports ?? []
  const selectedMonth = month ?? availableMonths[0]?.month_key

  let report = null
  if (selectedMonth) {
    const { data } = await supabase
      .from('business_monthly_reports')
      .select('*')
      .eq('business_id', biz.id)
      .eq('month_key', selectedMonth)
      .maybeSingle()
    report = data
  }

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">📊 التقارير</span>
          <h1 className="admin-header__title">تقارير {biz.name}</h1>
          <p className="admin-header__subtitle">مؤشرات شهرية بأرقام حقيقية</p>
        </div>
        <div className="admin-header__actions">
          <Link href="/merchant" className="admin-btn admin-btn--ghost">← لوحة النشاط</Link>
        </div>
      </div>

      {availableMonths.length > 1 && (
        <div style={{ padding: '0 20px', marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {availableMonths.map((r) => (
            <Link
              key={r.month_key}
              href={`?month=${r.month_key}`}
              className="admin-btn"
              style={{
                background: r.month_key === selectedMonth ? 'linear-gradient(135deg, #A855F7, #6B21FF)' : undefined,
                color: r.month_key === selectedMonth ? '#fff' : undefined,
              }}
            >
              {r.month_key}
            </Link>
          ))}
        </div>
      )}

      <div style={{ padding: '24px 20px' }}>
        {report ? (
          <ReportView report={report as any} />
        ) : (
          <div style={{ textAlign: 'center', padding: 60, borderRadius: 20, background: 'rgba(20,14,34,0.4)', border: '1px dashed rgba(168,85,247,0.25)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
            <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-cairo-play, system-ui)', fontSize: '1.2rem', color: '#F4F2FA' }}>لسه مفيش تقارير</h2>
            <p style={{ margin: '0 0 20px', color: '#A29DB5', fontSize: '0.9rem', lineHeight: 1.7 }}>
              التقارير بتتولد تلقائي يوم 2 من كل شهر — أو من الإدارة يدوياً في أي وقت
            </p>
            <Link href="/merchant" className="admin-btn">← رجوع</Link>
          </div>
        )}
      </div>
    </>
  )
}
