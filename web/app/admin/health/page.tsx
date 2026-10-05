import AccountPageHeader from '@/components/account-page-header'
import { getHealthSummary, getRecentErrors } from '@/lib/data/health'
import { HeartIcon } from '@/components/icons'
import EmptyState from '@/components/empty-state'
import styles from './health.module.css'

export const dynamic = 'force-dynamic'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'دلوقتي'
  if (m < 60) return `من ${m} دقيقة`
  const h = Math.floor(m / 60)
  if (h < 24) return `من ${h} ساعة`
  const d = Math.floor(h / 24)
  return `من ${d} يوم`
}

const SEVERITY_LABEL: Record<string, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالي',
  critical: 'حرج',
}

function severityClass(sev: string): string {
  const map: Record<string, string | undefined> = {
    low: styles.sev_low,
    medium: styles.sev_medium,
    high: styles.sev_high,
    critical: styles.sev_critical,
  }
  return map[sev] ?? ''
}

export default async function AdminHealthPage() {
  const [summary, errors] = await Promise.all([getHealthSummary(), getRecentErrors(50)])

  return (
    <div>
      <AccountPageHeader
        title="صحة النظام"
        description={`${summary.unresolved} خطأ مفتوح · ${summary.last24h} خلال 24 ساعة`}
      />

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>آخر 24 ساعة</div>
          <div className={styles.cardValue}>{summary.last24h}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>آخر 7 أيام</div>
          <div className={styles.cardValue}>{summary.last7d}</div>
        </div>
        <div className={`${styles.card} ${summary.critical24h > 0 ? styles.cardDanger : ''}`}>
          <div className={styles.cardLabel}>حرج (24س)</div>
          <div className={styles.cardValue}>{summary.critical24h}</div>
        </div>
        <div className={`${styles.card} ${summary.unresolved > 0 ? styles.cardWarn : ''}`}>
          <div className={styles.cardLabel}>غير محلول</div>
          <div className={styles.cardValue}>{summary.unresolved}</div>
        </div>
      </div>

      {summary.topPaths.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>أكتر المسارات مشاكل (24س)</h2>
          <ul className={styles.pathList}>
            {summary.topPaths.map((p) => (
              <li key={p.path} className={styles.pathItem}>
                <code className={styles.pathCode}>{p.path}</code>
                <span className={styles.pathCount}>{p.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>آخر الأخطاء</h2>
        {errors.length === 0 ? (
          <EmptyState
            Icon={HeartIcon}
            title="كل حاجة تمام"
            description="مفيش أخطاء مسجّلة — النظام شغّال زي الفل."
          />
        ) : (
          <ul className={styles.errorList}>
            {errors.map((e) => (
              <li key={e.id} className={`${styles.errorItem} ${severityClass(e.severity)}`}>
                <div className={styles.errorHead}>
                  <span className={`${styles.severity} ${severityClass(e.severity)}`}>
                    {SEVERITY_LABEL[e.severity] ?? e.severity}
                  </span>
                  <span className={styles.source}>{e.source}</span>
                  {e.path && <code className={styles.errorPath}>{e.path}</code>}
                  <span className={styles.time}>{timeAgo(e.created_at)}</span>
                </div>
                <div className={styles.errorMsg}>{e.message}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
