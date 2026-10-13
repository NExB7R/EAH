import AccountPageHeader from '@/components/account-page-header'
import {
  EyeIcon,
  TrendingUpIcon,
  TargetIcon,
  GlobeIcon,
  StoreIcon,
  ArrowLeftIcon,
} from '@/components/icons'
import {
  getAnalyticsSummary,
  getTopPages,
  getTopBusinesses,
  getReferrers,
  getDevices,
  getDailyViews,
  getPeriodDelta,
} from '@/lib/data/admin'
import { getAdminBadges } from '@/lib/data/admin'
import AnalyticsTabs from './analytics-tabs'
import ViewChart from './view-chart'
import ReportList from '../reports/report-list'
import { getReports } from '@/lib/data/admin'
import styles from './analytics.module.css'

export const dynamic = 'force-dynamic'

const DEVICE_LABEL: Record<string, string> = {
  mobile: 'موبايل',
  tablet: 'تابلت',
  desktop: 'كمبيوتر',
  unknown: 'غير معروف',
}

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString('ar-EG')
}

type SearchParams = {
  tab?: string
  days?: string
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const tab = params.tab ?? 'overview'
  const days = Math.min(90, Math.max(1, parseInt(params.days ?? '30', 10) || 30))

  const badges = await getAdminBadges()

  // ─── Reports tab ───
  if (tab === 'reports') {
    const reports = await getReports('all')
    const open = reports.filter((r) => r.status === 'pending' || r.status === 'reviewing').length
    return (
      <div>
        <AccountPageHeader
          title="التحليلات والتقارير"
          description={`${open} إبلاغ بحاجة مراجعة من ${reports.length}`}
        />
        <AnalyticsTabs reportsCount={open} moderationCount={badges.flaggedReviews} />
        <ReportList reports={reports} />
      </div>
    )
  }

  // ─── Moderation tab ───
  if (tab === 'moderation') {
    return (
      <div>
        <AccountPageHeader title="التحليلات والتقارير" description="مراجعة التقييمات المعلّمة" />
        <AnalyticsTabs reportsCount={badges.openReports} moderationCount={badges.flaggedReviews} />
        <div className={styles.moderationNotice}>
          <span className={styles.noticeIcon}>
            <TargetIcon size={24} />
          </span>
          <div className={styles.noticeBody}>
            <strong>{badges.flaggedReviews} تقييم بحاجة مراجعة</strong>
            <span>افتح صفحة المراجعة الكاملة لقبول/رفض التقييمات</span>
          </div>
          <a href="/admin/moderation" className={styles.noticeBtn}>
            <span>افتح المراجعة</span>
            <ArrowLeftIcon size={14} />
          </a>
        </div>
      </div>
    )
  }

  // ─── Overview tab (default) ───
  const [summary, daily, delta, topPages, topBiz, referrers, devices] = await Promise.all([
    getAnalyticsSummary(),
    getDailyViews(days),
    getPeriodDelta(days),
    getTopPages(days, 8),
    getTopBusinesses(days, 8),
    getReferrers(days, 6),
    getDevices(days),
  ])

  const totalDevices = devices.reduce((s, d) => s + d.count, 0) || 1
  const totalRefs = referrers.reduce((s, r) => s + r.count, 0) || 1

  return (
    <div>
      <AccountPageHeader title="التحليلات والتقارير" description={`نظرة شاملة — آخر ${days} يوم`} />

      <AnalyticsTabs reportsCount={badges.openReports} moderationCount={badges.flaggedReviews} />

      {/* ─── Stats ─── */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>
            <EyeIcon size={20} />
          </span>
          <div className={styles.statHead}>
            <span className={styles.statValue}>{fmt(delta.viewsCurrent)}</span>
            <DeltaBadge pct={delta.deltaPct} />
          </div>
          <span className={styles.statLabel}>مشاهدات ({days} يوم)</span>
          <span className={styles.statSub}>{fmt(delta.uniquesCurrent)} زائر فريد</span>
        </div>

        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.iconPurple}`}>
            <TrendingUpIcon size={20} />
          </span>
          <div className={styles.statHead}>
            <span className={styles.statValue}>{fmt(summary.viewsToday)}</span>
          </div>
          <span className={styles.statLabel}>مشاهدات اليوم</span>
          <span className={styles.statSub}>{fmt(summary.uniquesToday)} زائر</span>
        </div>

        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.iconGold}`}>
            <TargetIcon size={20} />
          </span>
          <div className={styles.statHead}>
            <span className={styles.statValue}>{fmt(summary.viewsMonth)}</span>
          </div>
          <span className={styles.statLabel}>آخر 30 يوم</span>
          <span className={styles.statSub}>{fmt(summary.uniquesMonth)} زائر فريد</span>
        </div>
      </section>

      {/* ─── Chart ─── */}
      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <TrendingUpIcon size={18} />
          <h3 className={styles.panelTitle}>المشاهدات اليومية</h3>
          <span className={styles.panelHint}>آخر {days} يوم</span>
        </header>
        <ViewChart data={daily} />
      </section>

      {/* ─── Two-col: pages + businesses ─── */}
      <div className={styles.twoCol}>
        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <TrendingUpIcon size={18} />
            <h3 className={styles.panelTitle}>أكثر الصفحات زيارة</h3>
            <span className={styles.panelHint}>آخر {days} يوم</span>
          </header>
          {topPages.length === 0 ? (
            <p className={styles.empty}>مفيش بيانات لسه</p>
          ) : (
            <ul className={styles.list}>
              {topPages.map((p, i) => {
                const max = topPages[0]?.count ?? 1
                const pct = Math.round((p.count / max) * 100)
                return (
                  <li key={p.path} className={styles.listItem}>
                    <span className={styles.rank}>{i + 1}</span>
                    <div className={styles.itemBody}>
                      <div className={styles.itemHead}>
                        <code className={styles.path}>{p.path}</code>
                        <span className={styles.count}>{p.count}</span>
                      </div>
                      <div className={styles.bar}>
                        <div className={styles.barFill} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <StoreIcon size={18} />
            <h3 className={styles.panelTitle}>أكثر الأنشطة زيارة</h3>
            <span className={styles.panelHint}>آخر {days} يوم</span>
          </header>
          {topBiz.length === 0 ? (
            <p className={styles.empty}>مفيش بيانات لسه</p>
          ) : (
            <ul className={styles.list}>
              {topBiz.map((b, i) => {
                const max = topBiz[0]?.count ?? 1
                const pct = Math.round((b.count / max) * 100)
                return (
                  <li key={b.id} className={styles.listItem}>
                    <span className={styles.rank}>{i + 1}</span>
                    <div className={styles.itemBody}>
                      <div className={styles.itemHead}>
                        <a href={`/businesses/${b.slug}`} className={styles.bizName}>
                          {b.name}
                        </a>
                        <span className={styles.count}>{b.count}</span>
                      </div>
                      <div className={styles.bar}>
                        <div
                          className={`${styles.barFill} ${styles.barGold}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {/* ─── Two-col: referrers + devices ─── */}
      <div className={styles.twoCol}>
        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <GlobeIcon size={18} />
            <h3 className={styles.panelTitle}>مصادر الزيارات</h3>
          </header>
          {referrers.length === 0 ? (
            <p className={styles.empty}>مفيش بيانات لسه</p>
          ) : (
            <ul className={styles.pieList}>
              {referrers.map((r) => {
                const pct = Math.round((r.count / totalRefs) * 100)
                return (
                  <li key={r.referrer} className={styles.pieItem}>
                    <div className={styles.pieInfo}>
                      <span className={styles.pieLabel}>{r.referrer}</span>
                      <span className={styles.piePct}>{pct}%</span>
                    </div>
                    <div className={styles.bar}>
                      <div className={styles.barFill} style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <TargetIcon size={18} />
            <h3 className={styles.panelTitle}>الأجهزة</h3>
          </header>
          {devices.length === 0 ? (
            <p className={styles.empty}>مفيش بيانات لسه</p>
          ) : (
            <ul className={styles.pieList}>
              {devices.map((d) => {
                const pct = Math.round((d.count / totalDevices) * 100)
                return (
                  <li key={d.device} className={styles.pieItem}>
                    <div className={styles.pieInfo}>
                      <span className={styles.pieLabel}>{DEVICE_LABEL[d.device] ?? d.device}</span>
                      <span className={styles.piePct}>{pct}%</span>
                    </div>
                    <div className={styles.bar}>
                      <div
                        className={`${styles.barFill} ${styles.barTeal}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

// ─── Delta Badge ───
function DeltaBadge({ pct }: { pct: number }) {
  const tone = pct > 0 ? styles.deltaUp : pct < 0 ? styles.deltaDown : styles.deltaNeutral
  const arrow = pct > 0 ? '↑' : pct < 0 ? '↓' : '·'
  return (
    <span className={`${styles.delta} ${tone}`}>
      {arrow} {Math.abs(pct)}%
    </span>
  )
}
