import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  SparklesIcon,
  ArrowLeftIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  StarIcon,
  EyeIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertIcon,
  GiftIcon,
  CrownGoldIcon,
  ClockIcon,
  SunriseIcon,
} from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { createClient } from '@/lib/supabase/server'
import PrintButton from './print-button'
import styles from './insight.module.css'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

type InsightRow = {
  id: string
  business_id: string
  period_start: string
  period_end: string
  data: {
    pageViews?: number
    uniqueVisitors?: number
    ordersTotal?: number
    ordersConfirmed?: number
    reviewsTotal?: number
    avgRating?: number
    avgResponseTimeMin?: number | null
    mediaCount?: number
    peakHour?: number | null
    peakDay?: string | null
    hourHistogram?: number[]
    dayHistogram?: Record<string, number>
    prevPeriod?: {
      pageViews: number
      ordersTotal: number
      reviewsTotal: number
      avgRating: number
    }
  } | null
  score: number | null
  summary: string | null
  ai_narrative: string | null
  top_points: {
    insights?: Array<{
      id: string
      severity: string
      title: string
      description: string
      action?: string
    }>
    strengths?: string[]
    weaknesses?: string[]
    opportunities?: string[]
    trends?: { viewsTrend: string; ordersTrend: string; ratingTrend: string }
  } | null
  comparison: {
    avgRating?: number
    totalInCategory?: number
  } | null
  created_at: string
}

async function getInsight(id: string): Promise<InsightRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_insights')
    .select(
      'id, business_id, period_start, period_end, data, score, summary, ai_narrative, top_points, comparison, created_at',
    )
    .eq('id', id)
    .maybeSingle()

  return (data as InsightRow) ?? null
}

const DAY_LABEL: Record<string, string> = {
  sun: 'الأحد',
  mon: 'الاتنين',
  tue: 'التلات',
  wed: 'الأربع',
  thu: 'الخميس',
  fri: 'الجمعة',
  sat: 'السبت',
}

function hourLabel(h: number): string {
  if (h === 0) return '12 بالليل'
  if (h < 12) return `${h} الصبح`
  if (h === 12) return '12 الضهر'
  if (h < 17) return `${h - 12} بعد الضهر`
  if (h < 20) return `${h - 12} المغرب`
  return `${h - 12} بالليل`
}

function pct(curr: number, prev: number): { text: string; tone: 'up' | 'down' | 'flat' } {
  if (prev === 0 && curr === 0) return { text: '—', tone: 'flat' }
  if (prev === 0) return { text: 'جديد', tone: 'up' }
  const delta = ((curr - prev) / prev) * 100
  const sign = delta >= 0 ? '+' : ''
  return {
    text: `${sign}${Math.round(delta)}%`,
    tone: delta > 5 ? 'up' : delta < -5 ? 'down' : 'flat',
  }
}

function getTone(score: number): 'teal' | 'gold' | 'orange' | 'red' {
  if (score >= 85) return 'teal'
  if (score >= 70) return 'gold'
  if (score >= 50) return 'orange'
  return 'red'
}

function getGrade(score: number): string {
  if (score >= 85) return 'ممتاز'
  if (score >= 70) return 'جيد جداً'
  if (score >= 50) return 'جيد'
  return 'يحتاج تحسين'
}

export default async function InsightPage({ params }: Props) {
  const session = await getUserSession()
  if (!session) redirect('/auth')

  const { id } = await params
  const insight = await getInsight(id)
  if (!insight) notFound()

  // فحص الصلاحية
  const supabase = await createClient()
  const { data: biz } = await supabase
    .from('businesses')
    .select('name, slug, owner_profile_id')
    .eq('id', insight.business_id)
    .single()

  if (!biz) notFound()

  const isAdmin = session.role === 'admin' || session.role === 'super_admin'
  const isOwner = biz.owner_profile_id === session.userId

  if (!isOwner && !isAdmin) {
    redirect('/merchant/insights')
  }

  const score = insight.score ?? 0
  const tone = getTone(score)
  const grade = getGrade(score)
  const date = new Date(insight.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const periodStart = new Date(insight.period_start).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const periodEnd = new Date(insight.period_end).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const aiNarrative = insight.ai_narrative
  const insights = insight.top_points?.insights ?? []
  const strengths = insight.top_points?.strengths ?? []
  const weaknesses = insight.top_points?.weaknesses ?? []
  const opportunities = insight.top_points?.opportunities ?? []
  const trends = insight.top_points?.trends

  const data = insight.data

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.topBar}>
        <Link href="/merchant/insights" className={styles.back}>
          <ArrowLeftIcon size={16} />
          <span>رجوع</span>
        </Link>
        <PrintButton />
      </div>

      {/* Report Header */}
      <section className={styles.report}>
        <div className={styles.reportGlow} aria-hidden />

        <div className={styles.reportHead}>
          <div className={styles.brand}>
            <CrownGoldIcon size={22} />
            <span>EAH — تقرير ذكي</span>
          </div>
          <div className={styles.reportMeta}>
            <span>
              النشاط: <strong>{biz.name}</strong>
            </span>
            <span>التاريخ: {date}</span>
            <span>
              الفترة: {periodStart} — {periodEnd}
            </span>
          </div>
        </div>

        {/* Score Hero */}
        <div className={styles.scoreHero}>
          <div className={`${styles.scoreCircle} ${styles[tone]}`}>
            <span className={styles.scoreNum}>{score}</span>
            <span className={styles.scoreMax}>/100</span>
          </div>
          <div className={styles.scoreInfo}>
            <span className={styles.scoreLabel}>مؤشر الأداء</span>
            <span className={`${styles.scoreGrade} ${styles[tone]}`}>{grade}</span>
            {insight.summary && <p className={styles.summary}>{insight.summary}</p>}
          </div>
        </div>

        {/* AI Narrative */}
        {aiNarrative && (
          <div className={styles.narrative}>
            <div className={styles.narrativeHead}>
              <SparklesIcon size={16} />
              <span>ملخص ذكي</span>
            </div>
            <p className={styles.narrativeText}>{aiNarrative}</p>
          </div>
        )}

        {/* KPIs Grid */}
        {data && (
          <div className={styles.kpiGrid}>
            <div className={styles.kpi}>
              <span className={styles.kpiIcon}>
                <EyeIcon size={18} />
              </span>
              <span className={styles.kpiValue}>{data.pageViews ?? 0}</span>
              <span className={styles.kpiLabel}>زيارات</span>
              <span className={styles.kpiSub}>{data.uniqueVisitors ?? 0} زائر فريد</span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiIcon}>
                <FileTextIcon size={18} />
              </span>
              <span className={styles.kpiValue}>{data.ordersTotal ?? 0}</span>
              <span className={styles.kpiLabel}>طلبات</span>
              <span className={styles.kpiSub}>{data.ordersConfirmed ?? 0} مكتمل</span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiIcon}>
                <StarIcon size={18} />
              </span>
              <span className={styles.kpiValue}>{data.avgRating ?? 0}</span>
              <span className={styles.kpiLabel}>متوسط التقييم</span>
              <span className={styles.kpiSub}>{data.reviewsTotal ?? 0} تقييم</span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiIcon}>
                <SparklesIcon size={18} />
              </span>
              <span className={styles.kpiValue}>{data.mediaCount ?? 0}</span>
              <span className={styles.kpiLabel}>صور</span>
              <span className={styles.kpiSub}>منشورة</span>
            </div>
          </div>
        )}
      </section>

      {/* Peak Hours */}
      {data?.peakHour !== null && data?.peakHour !== undefined && data?.peakDay && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>أوقات الذروة</h2>
          <div className={styles.peakGrid}>
            <div className={styles.peakCard}>
              <span className={styles.peakIcon}>
                <ClockIcon size={20} />
              </span>
              <span className={styles.peakLabel}>أكتر وقت</span>
              <span className={styles.peakValue}>{hourLabel(data.peakHour)}</span>
            </div>
            <div className={styles.peakCard}>
              <span className={styles.peakIcon}>
                <SunriseIcon size={20} />
              </span>
              <span className={styles.peakLabel}>أكتر يوم</span>
              <span className={styles.peakValue}>{DAY_LABEL[data.peakDay] ?? data.peakDay}</span>
            </div>
          </div>

          {/* Hour histogram */}
          {data.hourHistogram && data.hourHistogram.length === 24 && (
            <div className={styles.histogram}>
              {data.hourHistogram.map((c, h) => {
                const max = Math.max(...data.hourHistogram!, 1)
                const height = (c / max) * 100
                const isPeak = h === data.peakHour
                return (
                  <div key={h} className={styles.barCol} title={`${hourLabel(h)}: ${c}`}>
                    <div
                      className={`${styles.bar} ${isPeak ? styles.barPeak : ''}`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    {h % 3 === 0 && <span className={styles.barLabel}>{h}</span>}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Week-over-Week */}
      {data?.prevPeriod && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>مقارنة بالفترة السابقة</h2>
          <div className={styles.wowGrid}>
            <WowCard label="الزيارات" curr={data.pageViews ?? 0} prev={data.prevPeriod.pageViews} />
            <WowCard
              label="الطلبات"
              curr={data.ordersTotal ?? 0}
              prev={data.prevPeriod.ordersTotal}
            />
            <WowCard
              label="التقييمات"
              curr={data.reviewsTotal ?? 0}
              prev={data.prevPeriod.reviewsTotal}
            />
          </div>
        </section>
      )}

      {/* Trends */}
      {trends && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>الاتجاهات</h2>
          <div className={styles.trendsGrid}>
            <TrendCard label="الزيارات" trend={trends.viewsTrend} />
            <TrendCard label="الطلبات" trend={trends.ordersTrend} />
            <TrendCard label="التقييمات" trend={trends.ratingTrend} />
          </div>
        </section>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>التوصيات الذكية</h2>
          <div className={styles.insightsGrid}>
            {insights.map((ins) => (
              <div key={ins.id} className={`${styles.insight} ${styles[ins.severity]}`}>
                <div className={styles.insightHead}>
                  <span className={styles.insightDot} />
                  <h3 className={styles.insightTitle}>{ins.title}</h3>
                </div>
                <p className={styles.insightDesc}>{ins.description}</p>
                {ins.action && <span className={styles.insightAction}>💡 {ins.action}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Strengths / Weaknesses / Opportunities */}
      <section className={styles.threeCols}>
        {strengths.length > 0 && (
          <div className={`${styles.colCard} ${styles.colGreen}`}>
            <h3 className={styles.colTitle}>
              <CheckCircleIcon size={16} />
              نقاط القوة
            </h3>
            <ul className={styles.colList}>
              {strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {weaknesses.length > 0 && (
          <div className={`${styles.colCard} ${styles.colRed}`}>
            <h3 className={styles.colTitle}>
              <AlertIcon size={16} />
              نقاط محتاجة تحسين
            </h3>
            <ul className={styles.colList}>
              {weaknesses.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {opportunities.length > 0 && (
          <div className={`${styles.colCard} ${styles.colGold}`}>
            <h3 className={styles.colTitle}>
              <GiftIcon size={16} />
              فرص
            </h3>
            <ul className={styles.colList}>
              {opportunities.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Comparison */}
      {insight.comparison?.avgRating && insight.comparison.avgRating > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>المقارنة مع المنافسين</h2>
          <div className={styles.comparison}>
            <div className={styles.compRow}>
              <span className={styles.compLabel}>تقييمك</span>
              <div className={styles.compBar}>
                <div
                  className={styles.compFill}
                  style={{ width: `${((data?.avgRating ?? 0) / 5) * 100}%` }}
                />
              </div>
              <span className={styles.compValue}>{data?.avgRating ?? 0} ⭐</span>
            </div>
            <div className={styles.compRow}>
              <span className={styles.compLabel}>متوسط المنافسين</span>
              <div className={styles.compBar}>
                <div
                  className={`${styles.compFill} ${styles.compAvg}`}
                  style={{ width: `${(insight.comparison.avgRating / 5) * 100}%` }}
                />
              </div>
              <span className={styles.compValue}>{insight.comparison.avgRating} ⭐</span>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className={styles.reportFoot}>
        <p>تقرير EAH الذكي — {date}</p>
        <p>© 2026 EAH</p>
      </footer>
    </div>
  )
}

function WowCard({ label, curr, prev }: { label: string; curr: number; prev: number }) {
  const d = pct(curr, prev)
  return (
    <div className={styles.wowCard}>
      <span className={styles.wowLabel}>{label}</span>
      <div className={styles.wowValues}>
        <span className={styles.wowCurr}>{curr}</span>
        <span className={`${styles.wowDelta} ${styles['wow_' + d.tone]}`}>{d.text}</span>
      </div>
      <span className={styles.wowPrev}>السابق: {prev}</span>
    </div>
  )
}

function TrendCard({ label, trend }: { label: string; trend: string }) {
  const config = {
    up: { Icon: TrendingUpIcon, label: 'تحسّن', tone: 'teal' },
    down: { Icon: TrendingDownIcon, label: 'انخفاض', tone: 'red' },
    flat: { Icon: TrendingUpIcon, label: 'ثابت', tone: 'gray' },
  } as const

  const c = config[trend as keyof typeof config] ?? config.flat
  const Icon = c.Icon

  return (
    <div className={`${styles.trendCard} ${styles['trend_' + c.tone]}`}>
      <Icon size={18} />
      <span className={styles.trendLabel}>{label}</span>
      <span className={styles.trendValue}>{c.label}</span>
    </div>
  )
}
