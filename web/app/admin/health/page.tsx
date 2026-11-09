import Link from 'next/link'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { AlertIcon, CheckCircleIcon } from '@/components/icons'
import { getErrorsWithFilters, getHealthSummary } from '@/lib/data/health'
import { runHealthChecks } from '@/lib/data/health-checks'
import ErrorRow from './error-row'
import HealthFilters from './health-filters'
import AuditSection from './audit-section'
import HealthChecks from './health-checks'
import LaunchReadiness from './launch-readiness'
import VerifyLaunchButton from './verify-launch-button'
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
        description="مراقبة الأخطاء + سجل التدقيق + جاهزية الإطلاق."
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link
          href="https://github.com/NExB7R/EAH/blob/main/docs/LAUNCH_CHECKLIST.md"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 10,
            background: 'rgba(157, 78, 221, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            color: '#C77DFF',
            fontSize: '0.8rem',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          📋 Launch Checklist
        </Link>
        <Link
          href="https://github.com/NExB7R/EAH/blob/main/docs/TESTING_GUIDE.md"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 10,
            background: 'rgba(232, 199, 154, 0.1)',
            border: '1px solid rgba(232, 199, 154, 0.35)',
            color: '#f5d9a7',
            fontSize: '0.8rem',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          🧪 Testing Guide
        </Link>
      </div>

      <VerifyLaunchButton />

      <LaunchReadiness initialResult={null} />

      <HealthChecks initialResult={null} />

      {/* Tabs */}
      <nav className={styles.tabs} aria-label="تبويبات صحة النظام">
        <Link
          href="/admin/health"
          className={`${styles.tab} ${tab === 'errors' ? styles.tabActive : ''}`}
          aria-current={tab === 'errors' ? 'page' : undefined}
        >
          <span>الأخطاء</span>
          {summary.unresolved > 0 && (
            <span className={styles.tabBadge}>{summary.unresolved.toLocaleString('ar-EG')}</span>
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
          <div className={styles.cardValue}>{summary.last24h.toLocaleString('ar-EG')}</div>
        </article>
        <article className={styles.card}>
          <div className={styles.cardLabel}>أخطاء آخر 7 أيام</div>
          <div className={styles.cardValue}>{summary.last7d.toLocaleString('ar-EG')}</div>
        </article>
        <article
          className={summary.unresolved > 0 ? `${styles.card} ${styles.cardWarn}` : styles.card}
        >
          <div className={styles.cardLabel}>غير محلولة</div>
          <div className={styles.cardValue}>{summary.unresolved.toLocaleString('ar-EG')}</div>
        </article>
        <article
          className={summary.critical24h > 0 ? `${styles.card} ${styles.cardDanger}` : styles.card}
        >
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
