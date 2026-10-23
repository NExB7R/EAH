import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeftIcon } from '@/components/icons'
import PrintButton from './print-button'
import styles from './page.module.css'

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
      'id, period_start, period_end, score, summary, top_points, recommendations, ai_narrative, created_at, business:businesses(name)',
    )
    .eq('id', id)
    .maybeSingle()

  if (!data) notFound()

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
