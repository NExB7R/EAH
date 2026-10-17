import AccountPageHeader from '@/components/account-page-header'
import { getHealthSummary, getErrorsWithFilters } from '@/lib/data/health'
import { HeartIcon } from '@/components/icons'
import EmptyState from '@/components/empty-state'
import ExportButton from '@/components/ui/export-button'
import HealthFilters from './health-filters'
import ErrorRow from './error-row'
import styles from './health.module.css'

export const dynamic = 'force-dynamic'

type SearchParams = { severity?: string; resolved?: string; q?: string }

export default async function AdminHealthPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [summary, errors] = await Promise.all([
    getHealthSummary(),
    getErrorsWithFilters({
      severity: params.severity,
      resolved: (params.resolved as 'all' | 'unresolved' | 'resolved') ?? 'all',
      q: params.q,
      limit: 100,
    }),
  ])

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

      <div className={styles.topBar}>
        <ExportButton type="health" />
      </div>

      <HealthFilters />

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
              <ErrorRow key={e.id} error={e} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
