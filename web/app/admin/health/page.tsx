import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { AlertIcon, CheckCircleIcon } from '@/components/icons'
import { getErrorsWithFilters, getHealthSummary } from '@/lib/data/health'
import ErrorRow from './error-row'
import HealthFilters from './health-filters'
import styles from './health.module.css'

export const dynamic = 'force-dynamic'

type SearchParams = {
  severity?: string
  resolved?: string
  q?: string
}

const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const
const RESOLVED_STATES = ['all', 'unresolved', 'resolved'] as const

export default async function AdminHealthPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const severity = SEVERITIES.includes(params.severity as (typeof SEVERITIES)[number])
    ? params.severity
    : 'all'
  const resolved = RESOLVED_STATES.includes(params.resolved as (typeof RESOLVED_STATES)[number])
    ? (params.resolved as (typeof RESOLVED_STATES)[number])
    : 'all'
  const query = (params.q ?? '').trim().slice(0, 100)

  const [summary, errors] = await Promise.all([
    getHealthSummary(),
    getErrorsWithFilters({
      severity,
      resolved,
      q: query,
      limit: 100,
    }),
  ])

  return (
    <div>
      <AccountPageHeader
        title="صحة النظام والأخطاء"
        description="راقب أخطاء المنصة، حدّد الأعلى خطورة، وسجّل ما تم حله."
      />

      <section className={styles.grid} aria-label="ملخص صحة النظام">
        <article className={styles.card}>
          <div className={styles.cardLabel}>أخطاء آخر 24 ساعة</div>
          <div className={styles.cardValue}>{summary.last24h.toLocaleString('ar-EG')}</div>
        </article>
        <article className={styles.card}>
          <div className={styles.cardLabel}>أخطاء آخر 7 أيام</div>
          <div className={styles.cardValue}>{summary.last7d.toLocaleString('ar-EG')}</div>
        </article>
        <article className={summary.unresolved > 0 ? `${styles.card} ${styles.cardWarn}` : styles.card}>
          <div className={styles.cardLabel}>غير محلولة</div>
          <div className={styles.cardValue}>{summary.unresolved.toLocaleString('ar-EG')}</div>
        </article>
        <article className={summary.critical24h > 0 ? `${styles.card} ${styles.cardDanger}` : styles.card}>
          <div className={styles.cardLabel}>حرجة خلال 24 ساعة</div>
          <div className={styles.cardValue}>{summary.critical24h.toLocaleString('ar-EG')}</div>
        </article>
      </section>

      {summary.topPaths.length > 0 && (
        <section className={styles.section} aria-labelledby="health-top-paths">
          <h2 id="health-top-paths" className={styles.sectionTitle}>
            المسارات الأكثر تسجيلًا للأخطاء خلال 24 ساعة
          </h2>
          <ul className={styles.pathList}>
            {summary.topPaths.map((item) => (
              <li key={item.path} className={styles.pathItem}>
                <code className={styles.pathCode}>{item.path}</code>
                <span className={styles.pathCount}>{item.count.toLocaleString('ar-EG')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section} aria-labelledby="health-error-list">
        <h2 id="health-error-list" className={styles.sectionTitle}>سجل الأخطاء</h2>
        <HealthFilters />

        {errors.length > 0 ? (
          <ul className={styles.errorList}>
            {errors.map((error) => (
              <ErrorRow key={error.id} error={error} />
            ))}
          </ul>
        ) : (
          <EmptyState
            Icon={query || severity !== 'all' || resolved !== 'all' ? AlertIcon : CheckCircleIcon}
            title={query || severity !== 'all' || resolved !== 'all' ? 'مفيش نتائج للفلاتر دي' : 'مفيش أخطاء مطابقة'}
            description={
              query || severity !== 'all' || resolved !== 'all'
                ? 'غيّر مستوى الخطورة أو الحالة أو نص البحث.'
                : 'مفيش سجلات ضمن النطاق الحالي.'
            }
          />
        )}
      </section>
    </div>
  )
}
