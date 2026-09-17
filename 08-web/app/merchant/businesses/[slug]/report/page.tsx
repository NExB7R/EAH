import Link from 'next/link'
import { requireMerchantForBusiness } from '@/lib/admin/merchant-guard'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import { getBusinessStats, getBusinessReviews } from '@/lib/reviews'

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

  const metrics = [
    { label: `زيارات (${rangeDays}ي)`, value: viewsCount ?? 0, emoji: '👁', color: 'var(--eah-purple-2)' },
    { label: `كشوف (${rangeDays}ي)`, value: revealsCount ?? 0, emoji: '📞', color: '#A855F7' },
    { label: 'إجمالي التقييمات', value: stats.review_count, emoji: '⭐', color: 'var(--eah-gold)' },
    { label: 'متوسط التقييم', value: stats.avg_rating.toFixed(1), emoji: '📊', color: 'var(--eah-purple-soft)' },
    { label: 'عروض نشطة', value: stats.active_offers, emoji: '🔥', color: '#FB923C' },
  ]

  
  // confirmed orders count (from WhatsApp flow)
  const { count: confirmedOrders } = await supabase
    .from('order_requests')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', biz.id)
    .not('confirmed_at', 'is', null)

  const { count: totalOrders } = await supabase
    .from('order_requests')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', biz.id)

return (
    <>
      <FloatingCapsuleHeader />
      <main className="mpage">
        <div className="mpage__head">
          <div>
            <span className="mpage__kicker">التحليلات</span>
            <h1 className="mpage__title">📊 إحصائيات: {business.name}</h1>
            <p className="mpage__sub">نظرة سريعة على أداء النشاط على المنصة</p>
          </div>
          <Link href={`/merchant/businesses/${business.slug}/edit`} className="admin-btn admin-btn--primary">
            ✏️ تعديل البيانات
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
            📥 CSV
          </a>
        </div>

        <div className="mstats">
          {metrics.map((m) => (
            <div key={m.label} className="mstat">
              <span className="mstat__emoji">{m.emoji}</span>
              <span className="mstat__value" style={{ color: m.color }}>{m.value}</span>
              <span className="mstat__label">{m.label}</span>
            </div>
          ))}
        </div>

        {stats.review_count > 0 && (
          <section className="mreport-section">
            <h2 className="mreport-section__title">التقييمات بالتفصيل</h2>
            <div className="mratings">
              <RatingBar label="😋 الطعم" value={stats.avg_taste} />
              <RatingBar label="💰 القيمة" value={stats.avg_value} />
              <RatingBar label="⚡ السرعة" value={stats.avg_speed} />
              <RatingBar label="✨ التجربة" value={stats.avg_experience} />
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
              <div className="kpi-grid" style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <div className="kpi-card" style={{ padding: 20, borderRadius: 16, background: 'linear-gradient(135deg, rgba(37,211,102,.1), rgba(168,85,247,.04))', border: '1px solid rgba(37,211,102,.3)' }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-cairo-play, var(--font-cairo, system-ui))', fontSize: '1.6rem', fontWeight: 900, color: '#86EFAC' }}>{confirmedOrders ?? 0}</span>
            <span style={{ fontFamily: 'var(--font-cairo, system-ui)', fontSize: '.82rem', color: '#A29DB5' }}>✅ أوردر مؤكد (واتساب)</span>
          </div>
          <div className="kpi-card" style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(168,85,247,.2)' }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-cairo-play, var(--font-cairo, system-ui))', fontSize: '1.6rem', fontWeight: 900, color: '#E8C79A' }}>{totalOrders ?? 0}</span>
            <span style={{ fontFamily: 'var(--font-cairo, system-ui)', fontSize: '.82rem', color: '#A29DB5' }}>📦 إجمالي الأوردرات</span>
          </div>
        </div>
      </main>

      <style>{`
        .mstats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }
        .mstat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 20px 16px;
          border-radius: 20px;
          background: var(--eah-surface);
          border: 1px solid var(--eah-border);
        }
        .mstat__emoji { font-size: 1.5rem; }
        .mstat__value {
          font-family: var(--eah-font-display);
          font-size: 1.8rem;
          font-weight: 900;
          line-height: 1;
        }
        .mstat__label {
          font-family: var(--eah-font-body);
          font-size: 0.72rem;
          color: var(--eah-text-3);
          font-weight: 700;
        }
        .mreport-section {
          padding: 20px;
          border-radius: 20px;
          background: var(--eah-surface);
          border: 1px solid var(--eah-border);
          margin-bottom: 16px;
        }
        .mreport-section__title {
          font-family: var(--eah-font-display);
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--eah-text);
          margin: 0 0 16px;
        }
        .mratings { display: flex; flex-direction: column; gap: 12px; }
        .mreviews { display: flex; flex-direction: column; gap: 10px; }
        .mreview {
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(139, 92, 246, 0.05);
          border: 1px solid var(--eah-border);
        }
        .mreview__head {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-family: var(--eah-font-body);
          font-size: 0.75rem;
          color: var(--eah-text-4);
          margin-bottom: 6px;
        }
        .mreview__head strong { color: var(--eah-text); font-weight: 900; }
        .mreview__comment {
          font-family: var(--eah-font-body);
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--eah-text-2);
          margin: 0;
        }
        .mrange {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin: 0 0 18px;
          padding: 8px 12px;
          border-radius: 14px;
          background: rgba(168, 85, 247, 0.04);
          border: 1px solid var(--eah-border);
        }
        .mrange__label {
          font-family: var(--eah-font-body);
          font-size: 0.75rem;
          color: var(--eah-text-3);
          font-weight: 800;
          margin-inline-end: 4px;
        }
        .mrange__btn {
          padding: 6px 12px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid var(--eah-border);
          color: var(--eah-text-2);
          font-family: var(--eah-font-body);
          font-size: 0.72rem;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.2s;
        }
        .mrange__btn:hover {
          border-color: var(--eah-purple-2);
          color: var(--eah-text);
        }
        .mrange__btn.is-active {
          background: linear-gradient(135deg, #6B21FF, #A855F7);
          border-color: transparent;
          color: #fff;
        }
        .mrange__export {
          margin-inline-start: auto;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(192, 132, 252, 0.08);
          border: 1px solid rgba(192, 132, 252, 0.3);
          color: var(--eah-purple-soft);
          font-family: var(--eah-font-body);
          font-size: 0.72rem;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.2s;
        }
        .mrange__export:hover {
          background: rgba(192, 132, 252, 0.18);
          border-color: rgba(192, 132, 252, 0.55);
        }
      `}</style>
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
