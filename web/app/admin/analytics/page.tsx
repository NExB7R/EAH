import AccountPageHeader from '@/components/account-page-header'
import { EyeIcon, TrendingUpIcon, TargetIcon, GlobeIcon, StoreIcon } from '@/components/icons'
import {
  getAnalyticsSummary,
  getTopPages,
  getTopBusinesses,
  getReferrers,
  getDevices,
} from '@/lib/data/admin'
import styles from './analytics.module.css'

export const dynamic = 'force-dynamic'

const DEVICE_LABEL: Record<string, string> = {
  mobile: 'موبايل',
  tablet: 'تابلت',
  desktop: 'كمبيوتر',
  unknown: 'غير معروف',
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString('ar-EG')
}

export default async function AdminAnalyticsPage() {
  const [summary, topPages, topBiz, referrers, devices] = await Promise.all([
    getAnalyticsSummary(),
    getTopPages(7, 8),
    getTopBusinesses(7, 8),
    getReferrers(7, 6),
    getDevices(7),
  ])

  const totalDevices = devices.reduce((s, d) => s + d.count, 0) || 1
  const totalRefs = referrers.reduce((s, r) => s + r.count, 0) || 1

  return (
    <div>
      <AccountPageHeader title="التحليلات" description="نظرة على زوار المنصة — آخر 30 يوم" />

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>
            <EyeIcon size={20} />
          </span>
          <span className={styles.statValue}>{fmt(summary.viewsToday)}</span>
          <span className={styles.statLabel}>مشاهدات اليوم</span>
          <span className={styles.statSub}>{fmt(summary.uniquesToday)} زائر</span>
        </div>

        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.iconPurple}`}>
            <TrendingUpIcon size={20} />
          </span>
          <span className={styles.statValue}>{fmt(summary.viewsWeek)}</span>
          <span className={styles.statLabel}>آخر 7 أيام</span>
          <span className={styles.statSub}>{fmt(summary.uniquesWeek)} زائر فريد</span>
        </div>

        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.iconGold}`}>
            <TargetIcon size={20} />
          </span>
          <span className={styles.statValue}>{fmt(summary.viewsMonth)}</span>
          <span className={styles.statLabel}>آخر 30 يوم</span>
          <span className={styles.statSub}>{fmt(summary.uniquesMonth)} زائر فريد</span>
        </div>
      </section>

      <div className={styles.twoCol}>
        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <TrendingUpIcon size={18} />
            <h3 className={styles.panelTitle}>أكثر الصفحات زيارة</h3>
            <span className={styles.panelHint}>آخر 7 أيام</span>
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
            <span className={styles.panelHint}>آخر 7 أيام</span>
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
