import Link from 'next/link'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { AlertIcon, CheckCircleIcon } from '@/components/icons'
import { getErrorsWithFilters, getHealthSummary } from '@/lib/data/health'
import ErrorRow from './error-row'
import HealthFilters from './health-filters'
import AuditSection from './audit-section'
import styles from './health.module.css'

export const dynamic = 'force-dynamic'

type SearchParams = {
  tab?: string
  severity?: string
  resolved?: string
  q?: string
  action?: string
  actor?: string
}

const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const
const RESOLVED_STATES = ['all', 'unresolved', 'resolved'] as const

export default async function AdminHealthPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const tab: 'errors' | 'audit' = params.tab === 'audit' ? 'audit' : 'errors'

  // Fetch summary always (used in tab badge + errors tab)
  const summary = await getHealthSummary()

  return (
    <div>
      <AccountPageHeader
        title="صحة النظام والتدقيق"
        description="مراقبة الأخطاء + سجل التدقيق في مكان واحد."
      />

      {/* Tabs */}
      <nav className={styles.tabs} aria-label="تبويبات صحة النظام">
        <Link
          href="/admin/health"
          className={`${styles.tab} ${tab === 'errors' ? styles.tabActive : ''}`}
          aria-current={tab === 'errors' ? 'page' : undefined}
        >
          <span>الأخطاء</span>
          {summary.unresolved > 0 && (
            <span className={styles.tabBadge}>{summary.unresolved.toLocaleString('en-US')}</span>
          )}
        </Link>
        <Link
          href="/admin/health?tab=audit"
          className={`${styles.tab} ${tab === 'audit' ? styles.tabActive : ''}`}
          aria-current={tab === 'audit' ? 'page' : undefined}
        >
          <span>سجل التدقيق</span>
        </Link>
      </nav>

      {tab === 'audit' ? (
        <AuditSection q={params.q} action={params.action} actor={params.actor} />
      ) : (
        <ErrorsTab params={params} summary={summary} />
      )}
    </div>
  )
}

async function ErrorsTab({
  params,
  summary,
}: {
  params: SearchParams
  summary: Awaited<ReturnType<typeof getHealthSummary>>
}) {
  const severity = SEVERITIES.includes(params.severity as (typeof SEVERITIES)[number])
    ? params.severity
    : 'all'
  const resolved = RESOLVED_STATES.includes(params.resolved as (typeof RESOLVED_STATES)[number])
    ? (params.resolved as (typeof RESOLVED_STATES)[number])
    : 'all'
  const query = (params.q ?? '').trim().slice(0, 100)

  const errors = await getErrorsWithFilters({
    severity,
    resolved,
    q: query,
    limit: 100,
  })

  return (
    <>
      <section className={styles.grid} aria-label="ملخص صحة النظام">
        <article className={styles.card}>
          <div className={styles.cardLabel}>أخطاء آخر 24 ساعة</div>
          <div className={styles.cardValue}>{summary.last24h.toLocaleString('en-US')}</div>
        </article>
        <article className={styles.card}>
          <div className={styles.cardLabel}>أخطاء آخر 7 أيام</div>
          <div className={styles.cardValue}>{summary.last7d.toLocaleString('en-US')}</div>
        </article>
        <article
          className={summary.unresolved > 0 ? `${styles.card} ${styles.cardWarn}` : styles.card}
        >
          <div className={styles.cardLabel}>غير محلولة</div>
          <div className={styles.cardValue}>{summary.unresolved.toLocaleString('en-US')}</div>
        </article>
        <article
          className={summary.critical24h > 0 ? `${styles.card} ${styles.cardDanger}` : styles.card}
        >
          <div className={styles.cardLabel}>حرجة خلال 24 ساعة</div>
          <div className={styles.cardValue}>{summary.critical24h.toLocaleString('en-US')}</div>
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
                <span className={styles.pathCount}>{item.count.toLocaleString('en-US')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section} aria-labelledby="health-error-list">
        <h2 id="health-error-list" className={styles.sectionTitle}>
          سجل الأخطاء
        </h2>
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
            title={
              query || severity !== 'all' || resolved !== 'all'
                ? 'مفيش نتائج للفلاتر دي'
                : 'مفيش أخطاء مطابقة'
            }
            description={
              query || severity !== 'all' || resolved !== 'all'
                ? 'غيّر مستوى الخطورة أو الحالة أو نص البحث.'
                : 'مفيش سجلات ضمن النطاق الحالي.'
            }
          />
        )}
      </section>
    </>
  )
}
