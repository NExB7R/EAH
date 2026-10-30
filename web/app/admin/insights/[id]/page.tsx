import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeftIcon } from '@/components/icons'
import PrintButton from './print-button'
import SendToMerchant from './send-to-merchant'
import styles from './page.module.css'

type OrderMetricsView = {
  total?: number
  accept_rate?: number
  deliver_rate?: number
  avg_response_min?: number | null
  on_time_delivery_rate?: number | null
  avg_feedback_rating?: number | null
  feedback_count?: number
  issue_breakdown?: Record<string, number>
  payment_breakdown?: Record<string, number>
}

export const dynamic = 'force-dynamic'

function asStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return []
  return val.filter((x): x is string => typeof x === 'string')
}

export default async function InsightDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_insights')
    .select(
      'id, period_start, period_end, score, summary, top_points, recommendations, ai_narrative, created_at, data, business:businesses(name)',
    )
    .eq('id', id)
    .maybeSingle()

  if (!data) notFound()

  const rawData = (data.data as Record<string, unknown> | null) ?? {}
  const orderMetricsView = (rawData.order_metrics ?? null) as OrderMetricsView | null

  const bizName = (data.business as unknown as { name: string } | null)?.name ?? '—'
  const topPoints = asStringArray(data.top_points)
  const recs = asStringArray(data.recommendations)

  const period = `${new Date(data.period_start).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} — ${new Date(data.period_end).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`
  const created = new Date(data.created_at ?? data.period_end).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className={styles.root}>
      <div className={styles.toolbar} data-no-print>
        <Link href="/admin/insights" className={styles.back}>
          <ArrowLeftIcon size={14} />
          <span>رجوع للتقارير</span>
        </Link>
        <SendToMerchant insightId={data.id} />
        <PrintButton />
      </div>

      <article className={styles.sheet}>
        <header className={styles.head}>
          <h1 className={styles.title}>تقرير أداء — {bizName}</h1>
          <p className={styles.meta}>
            الفترة: {period} · صدر: {created}
          </p>
        </header>

        <section className={styles.score}>
          <span className={styles.scoreNum}>{data.score ?? '—'}</span>
          <span className={styles.scoreMax}>/100</span>
          {data.summary && <p className={styles.summary}>{data.summary}</p>}
        </section>

        {orderMetricsView && (orderMetricsView.total ?? 0) > 0 && (
          <section className={styles.block}>
            <h2 className={styles.h2}>سجل الطلبات</h2>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCell}>
                <span className={styles.metricLabel}>إجمالي الطلبات</span>
                <span className={styles.metricValue}>{orderMetricsView.total ?? 0}</span>
              </div>
              <div className={styles.metricCell}>
                <span className={styles.metricLabel}>نسبة القبول</span>
                <span className={styles.metricValue}>{orderMetricsView.accept_rate ?? 0}%</span>
              </div>
              <div className={styles.metricCell}>
                <span className={styles.metricLabel}>نسبة التسليم</span>
                <span className={styles.metricValue}>{orderMetricsView.deliver_rate ?? 0}%</span>
              </div>
              {typeof orderMetricsView.avg_response_min === 'number' && (
                <div className={styles.metricCell}>
                  <span className={styles.metricLabel}>متوسط الرد</span>
                  <span className={styles.metricValue}>{orderMetricsView.avg_response_min} د</span>
                </div>
              )}
              {typeof orderMetricsView.on_time_delivery_rate === 'number' && (
                <div className={styles.metricCell}>
                  <span className={styles.metricLabel}>التسليم في الوقت</span>
                  <span className={styles.metricValue}>
                    {orderMetricsView.on_time_delivery_rate}%
                  </span>
                </div>
              )}
              {typeof orderMetricsView.avg_feedback_rating === 'number' && (
                <div className={styles.metricCell}>
                  <span className={styles.metricLabel}>رضا المشترين</span>
                  <span className={styles.metricValue}>
                    ⭐ {orderMetricsView.avg_feedback_rating}/5
                  </span>
                  <span className={styles.metricHint}>{orderMetricsView.feedback_count} تقييم</span>
                </div>
              )}
            </div>

            {orderMetricsView.issue_breakdown &&
              Object.keys(orderMetricsView.issue_breakdown).length > 0 && (
                <div className={styles.block} style={{ marginTop: 16 }}>
                  <h3 className={styles.h3}>المشاكل المتكررة</h3>
                  <ul className={styles.list}>
                    {Object.entries(orderMetricsView.issue_breakdown)
                      .sort((a, b) => b[1] - a[1])
                      .map(([key, count]) => {
                        const labels: Record<string, string> = {
                          late: 'التأخير',
                          missing: 'حاجة ناقصة',
                          quality: 'الجودة',
                          payment: 'مشكلة الدفع',
                          other: 'أخرى',
                        }
                        return (
                          <li key={key}>
                            {labels[key] ?? key} — {count} تقرير
                          </li>
                        )
                      })}
                  </ul>
                </div>
              )}
          </section>
        )}

        {topPoints.length > 0 && (
          <section className={styles.block}>
            <h2 className={styles.h2}>أهم الملاحظات</h2>
            <ul className={styles.list}>
              {topPoints.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </section>
        )}

        {recs.length > 0 && (
          <section className={styles.block}>
            <h2 className={styles.h2}>التوصيات</h2>
            <ul className={styles.list}>
              {recs.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </section>
        )}

        {data.ai_narrative && (
          <section className={styles.block}>
            <h2 className={styles.h2}>تحليل مفصل</h2>
            <p className={styles.narrative}>{data.ai_narrative}</p>
          </section>
        )}

        <footer className={styles.footer}>
          <span>EAH — منصة الأنشطة</span>
          <span>{bizName}</span>
        </footer>
      </article>
    </div>
  )
}
