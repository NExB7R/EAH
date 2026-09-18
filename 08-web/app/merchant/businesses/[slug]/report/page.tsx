import Link from 'next/link'
import { requireMerchantForBusiness } from '@/lib/admin/merchant-guard'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import MerchantInsights from '@/components/merchant-insights'
import { getBusinessStats, getBusinessReviews } from '@/lib/reviews'
import './report.css'
import { IcUpload } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إحصائيات النشاط' }

export default async function MerchantReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ range?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const rangeDays = Math.min(90, Math.max(7, parseInt(sp.range ?? '30', 10) || 30))
  const { business, supabase } = await requireMerchantForBusiness(slug)

  const [stats, reviews] = await Promise.all([
    getBusinessStats(business.id),
    getBusinessReviews(business.id, 10),
  ])

  // نظرة سريعة على الزيارات — حسب الفترة (scoped queries for perf)
  const since = new Date(Date.now() - rangeDays * 86400000).toISOString()
  const { count: viewsCount } = await supabase
    .from('page_view_events')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .gte('created_at', since)

  const { count: revealsCount } = await supabase
    .from('contact_reveals')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .gte('created_at', since)

  const { count: uniqueVisitsCount } = await supabase
    .from('business_unique_visits')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .gte('created_at', since)

  // ─── Funnel data ───
  const { data: funnelData } = await supabase.rpc('get_business_funnel', {
    p_business_id: business.id,
    p_days: rangeDays,
  })
  const funnel = (funnelData as any) ?? {
    views: 0, reveals: 0, order_start: 0, order_confirm: 0, conversion_rate: 0, peak_hours: []
  }

  const metrics = [
    { label: `زيارات (${rangeDays}ي)`, value: viewsCount ?? 0, color: 'var(--eah-purple-2)' },
    { label: `زيارات فريدة`, value: uniqueVisitsCount ?? 0, color: '#E8C79A' },
    { label: `كشوف أرقام`, value: revealsCount ?? 0, color: '#A855F7' },
    { label: `التقييمات`, value: stats.review_count, color: 'var(--eah-gold)' },
    { label: `متوسط التقييم`, value: stats.avg_rating.toFixed(1), color: 'var(--eah-purple-soft)' },
    { label: `عروض نشطة`, value: stats.active_offers, color: '#FB923C' },
  ]

  
  // confirmed orders count (from WhatsApp flow)
  const { count: confirmedOrders } = await supabase
    .from('order_requests')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .not('confirmed_at', 'is', null)

  const { count: totalOrders } = await supabase
    .from('order_requests')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)

  // daily insights (last 14 days)
  const { data: dailyViews } = await supabase
    .from('page_view_events')
    .select('created_at')
    .eq('business_id', business.id)
    .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString())

  const dailyMap = new Map<string, number>()
  for (const ev of (dailyViews ?? []) as { created_at: string }[]) {
    const day = ev.created_at.slice(0, 10)
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1)
  }
  // unique visits daily (14d)
  const { data: uniqueRows } = await supabase
    .from('business_unique_visits')
    .select('visit_day')
    .eq('business_id', business.id)
    .gte('visit_day', new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10))

  const uniqueMap = new Map<string, number>()
  for (const row of (uniqueRows ?? []) as { visit_day: string }[]) {
    uniqueMap.set(row.visit_day, (uniqueMap.get(row.visit_day) ?? 0) + 1)
  }

  const daily = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000)
    const key = d.toISOString().slice(0, 10)
    return {
      day: key,
      views: dailyMap.get(key) ?? 0,
      reveals: 0,
      orders: 0,
      uniqueVisits: uniqueMap.get(key) ?? 0,
    }
  })

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="mpage">
        <div className="mpage__head">
          <div>
            <span className="mpage__kicker">التحليلات</span>
            <h1 className="mpage__title">إحصائيات: {business.name}</h1>
            <p className="mpage__sub">نظرة سريعة على أداء النشاط على المنصة</p>
          </div>
          <Link href={`/merchant/businesses/${business.slug}/edit`} className="admin-btn admin-btn--primary">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:4}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> تعديل البيانات
          </Link>
        </div>

        <div className="mrange">
          <span className="mrange__label">الفترة:</span>
          {[7, 14, 30, 90].map((r) => (
            <Link
              key={r}
              href={`?range=${r}`}
              className={`mrange__btn ${rangeDays === r ? 'is-active' : ''}`}
            >
              {r === 90 ? '3 شهور' : `${r} يوم`}
            </Link>
          ))}
          <a
            href={`/api/merchant/export?business=${business.id}&range=${rangeDays}`}
            className="mrange__export"
          >
            <IcUpload /> CSV
          </a>
        </div>

        <div className="mstats">
          {metrics.map((m) => (
            <div key={m.label} className="mstat">
              <span className="mstat__value" style={{ color: m.color }}>{m.value}</span>
              <span className="mstat__label">{m.label}</span>
            </div>
          ))}
        </div>

        {stats.review_count > 0 && (
          <section className="mreport-section">
            <h2 className="mreport-section__title">التقييمات بالتفصيل</h2>
            <div className="mratings">
              <RatingBar label=" الطعم" value={stats.avg_taste} />
              <RatingBar label="القيمة" value={stats.avg_value} />
              <RatingBar label="السرعة" value={stats.avg_speed} />
              <RatingBar label="التجربة" value={stats.avg_experience} />
            </div>
          </section>
        )}

        {reviews.length > 0 && (
          <section className="mreport-section">
            <h2 className="mreport-section__title">آخر التقييمات</h2>
            <div className="mreviews">
              {reviews.map((r) => (
                <div key={r.id} className="mreview">
                  <div className="mreview__head">
                    <strong>{r.user_name ?? 'زائر'}</strong>
                    <span>{new Date(r.created_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                  {r.comment && <p className="mreview__comment">{r.comment}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
              <div className="mkpi-grid">
          <div className="mkpi-card mkpi-card--success">
            <span className="mkpi-value">{confirmedOrders ?? 0}</span>
            <span className="mkpi-label">أوردر مؤكد (واتساب)</span>
          </div>
          <div className="mkpi-card mkpi-card--gold">
            <span className="mkpi-value">{totalOrders ?? 0}</span>
            <span className="mkpi-label">إجمالي الأوردرات</span>
          </div>
        </div>
              <section className="mreport-section">
          <h2 className="mreport-section__title">قمع التحويل ({rangeDays} يوم)</h2>
          <div className="mfunnel-grid">
            <div className="mfunnel-card">
              <div className="mfunnel-num">{funnel.views}</div>
              <div className="mfunnel-label">مشاهدات</div>
            </div>
            <div className="mfunnel-card mfunnel-card--reveal">
              <div className="mfunnel-num">{funnel.reveals}</div>
              <div className="mfunnel-label">كشوف أرقام</div>
            </div>
            <div className="mfunnel-card mfunnel-card--start">
              <div className="mfunnel-num">{funnel.order_start}</div>
              <div className="mfunnel-label">بدأوا طلب</div>
            </div>
            <div className="mfunnel-card mfunnel-card--confirm">
              <div className="mfunnel-num">{funnel.order_confirm}</div>
              <div className="mfunnel-label">أوردرات مؤكدة</div>
            </div>
            <div className="mfunnel-card mfunnel-card--rate">
              <div className="mfunnel-num">{funnel.conversion_rate}%</div>
              <div className="mfunnel-label">معدل التحويل</div>
            </div>
          </div>

          {funnel.peak_hours && funnel.peak_hours.length > 0 && (
            <>
              <h3 className="mpeak-title">أكثر ساعات النشاط</h3>
              <div className="mpeak-list">
                {funnel.peak_hours.map((h: any) => (
                  <span key={h.hour} className="mpeak-chip">
                    {h.hour.toString().padStart(2, '0')}:00 — {h.count}
                  </span>
                ))}
              </div>
            </>
          )}
        </section>

        <MerchantInsights
          daily={daily}
          totalViews={viewsCount ?? 0}
          totalReveals={revealsCount ?? 0}
          totalOrders={totalOrders ?? 0}
          totalUniqueVisits={uniqueVisitsCount ?? 0}
          avgRating={stats.avg_rating ?? 0}
        />
      </main>
</>
  )
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontFamily: 'var(--eah-font-body)', fontSize: '0.78rem' }}>
        <span style={{ color: 'var(--eah-text-3)' }}>{label}</span>
        <strong style={{ color: 'var(--eah-gold)' }}>{value.toFixed(1)}</strong>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: 'rgba(139, 92, 246, 0.12)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #6B21FF, #A855F7, #E8C79A)', borderRadius: 999 }} />
      </div>
    </div>
  )
}
