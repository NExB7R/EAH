import { createClient } from '@/lib/supabase-server'

function num(value: unknown) {
  return typeof value === 'number' ? value : Number(value ?? 0)
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const [{ data: summary }, { data: businesses }, { data: pages }, { data: daily }] = await Promise.all([
    supabase.rpc('admin_analytics_summary'),
    supabase.rpc('admin_top_businesses_analytics', { p_days: 7 }),
    supabase.rpc('admin_top_pages_analytics', { p_days: 7 }),
    supabase.rpc('admin_daily_analytics', { p_days: 7 }),
  ])

  const safeSummary = summary ?? {}
  const businessRows = businesses ?? []
  const pageRows = pages ?? []
  const dailyRows = daily ?? []
  const maxDaily = Math.max(1, ...dailyRows.map((row: any) => num(row.views)))

  return (
    <section>
      <header className="eah-admin-header">
        <div>
          <span className="eah-admin-kicker">ANALYTICS • LIVE</span>
          <h1>الإحصائيات والتحليلات</h1>
          <p>أرقام الزيارات، الزوار الفريدين، النشاط الحالي، وأداء كل نشاط وصفحة.</p>
        </div>
        <span className="eah-admin-badge live">Live الآن</span>
      </header>

      <div className="eah-admin-stat-grid">
        {[
          ['زوار الآن', num(safeSummary.live_visitors), 'كل الموقع خلال آخر دقيقتين'],
          ['على صفحات الأنشطة الآن', num(safeSummary.live_business_visitors), 'زوار حاليون لصفحات الأنشطة'],
          ['زيارات اليوم', num(safeSummary.views_today), 'Page views'],
          ['زوار فريدون اليوم', num(safeSummary.unique_visitors_today), 'Unique visitors'],
          ['زيارات آخر 7 أيام', num(safeSummary.views_7d), 'كل الموقع'],
          ['زوار فريدون آخر 7 أيام', num(safeSummary.unique_visitors_7d), 'كل الموقع'],
          ['زيارات آخر 30 يوم', num(safeSummary.views_30d), 'كل الموقع'],
          ['زوار فريدون آخر 30 يوم', num(safeSummary.unique_visitors_30d), 'كل الموقع'],
        ].map(([label, value, hint]) => (
          <div className="eah-admin-stat-card" key={label as string}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{hint}</small>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 16, marginTop: 18 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="section-head"><div><h2>الزيارات اليومية</h2><span>آخر 7 أيام</span></div></div>
          <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
            {dailyRows.map((row: any) => {
              const views = num(row.views)
              const visitors = num(row.unique_visitors)
              return (
                <div key={String(row.day)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                    <span>{new Date(String(row.day)).toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'numeric' })}</span>
                    <span style={{ opacity: .75 }}>{views} زيارة • {visitors} زائر</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(3, Math.round((views / maxDaily) * 100))}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#a855f7,#7c3aed)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="section-head"><div><h2>الأكثر زيارة الآن</h2><span>نشاط حالي خلال آخر دقيقتين</span></div></div>
          <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
            {businessRows.slice().sort((a: any, b: any) => num(b.live_visitors) - num(a.live_visitors)).slice(0, 8).map((row: any, index: number) => (
              <div key={row.business_id} className="eah-admin-business-card" style={{ padding: 12 }}>
                <div><strong>#{index + 1} {row.business_name}</strong><div className="eah-admin-business-sub">{num(row.live_visitors)} الآن • {num(row.views)} زيارة / 7 أيام</div></div>
                <span className="eah-admin-badge live">{num(row.live_visitors)} Live</span>
              </div>
            ))}
            {!businessRows.length && <div className="eah-admin-business-sub">لسه مفيش زيارات مسجلة.</div>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="section-head"><div><h2>ترتيب الأنشطة</h2><span>آخر 7 أيام</span></div></div>
          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
            {businessRows.slice(0, 10).map((row: any, index: number) => (
              <div key={row.business_id} style={{ display: 'grid', gridTemplateColumns: '34px 1fr auto', alignItems: 'center', gap: 10 }}>
                <strong>{index + 1}</strong>
                <div><div>{row.business_name}</div><div className="eah-admin-business-sub">{num(row.unique_visitors)} زائر فريد</div></div>
                <strong>{num(row.views)}</strong>
              </div>
            ))}
            {!businessRows.length && <div className="eah-admin-business-sub">لسه مفيش بيانات.</div>}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="section-head"><div><h2>أكثر الصفحات زيارة</h2><span>آخر 7 أيام</span></div></div>
          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
            {pageRows.slice(0, 10).map((row: any) => (
              <div key={row.path} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 10 }}>
                <div><div style={{ direction: 'ltr', textAlign: 'left' }}>{row.path}</div><div className="eah-admin-business-sub">{num(row.unique_visitors)} زائر فريد • {num(row.live_visitors)} الآن</div></div>
                <strong>{num(row.views)}</strong>
              </div>
            ))}
            {!pageRows.length && <div className="eah-admin-business-sub">لسه مفيش بيانات.</div>}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 16 }}>
        <strong>مهم للتقارير التجارية:</strong> أرقام التاجر هتتحسب من نفس المصدر المركزي، مع فصل &quot;الزيارات&quot; عن &quot;الزوار الفريدين&quot; وعن &quot;الزوار الحاليين Live&quot;، عشان التقرير الأسبوعي يبقى قابل للفهم والمقارنة.
      </div>
    </section>
  )
}
