import { FileTextIcon, ClockIcon, UserIcon, TrendingUpIcon, AlertIcon } from '@/components/icons'
import EmptyState from '@/components/empty-state'
import { getAuditLogs, getAuditStats } from '@/lib/data/admin'
import AuditFilters from '../audit/audit-filters'
import styles from '../audit/audit.module.css'

// ═══════════════════════════════════════════════════════════════════
// Audit section — extracted from /admin/audit for health merge (SPRAWL-01)
// ═══════════════════════════════════════════════════════════════════

const ACTION_LABEL: Record<string, { label: string; tone: string }> = {
  'featured.enable': { label: 'تفعيل التمييز', tone: 'gold' },
  'featured.disable': { label: 'إلغاء التمييز', tone: 'red' },
  'featured.pin': { label: 'تثبيت', tone: 'gold' },
  'featured.unpin': { label: 'إلغاء التثبيت', tone: 'purple' },
  'featured.reorder': { label: 'ترتيب', tone: 'purple' },
  'featured.extend': { label: 'تمديد', tone: 'teal' },
  'notifications.broadcast': { label: 'إشعار جماعي', tone: 'purple' },
  'review.moderate': { label: 'مراجعة تقييم', tone: 'teal' },
  'user.ban': { label: 'حظر مستخدم', tone: 'red' },
  'user.unban': { label: 'إلغاء حظر', tone: 'teal' },
  'business.approve': { label: 'موافقة نشاط', tone: 'teal' },
  'business.reject': { label: 'رفض نشاط', tone: 'red' },
  'business.archive': { label: 'إخفاء نشاط', tone: 'red' },
  'business.republish': { label: 'إعادة نشر', tone: 'teal' },
  'business.delete': { label: 'حذف نشاط', tone: 'red' },
  'subscription.approve': { label: 'موافقة اشتراك', tone: 'teal' },
  'subscription.reject': { label: 'رفض اشتراك', tone: 'red' },
  'subscription.extend': { label: 'تمديد اشتراك', tone: 'teal' },
  'subscription.cancel': { label: 'إلغاء اشتراك', tone: 'red' },
  'ad.approve': { label: 'موافقة إعلان', tone: 'teal' },
  'ad.reject': { label: 'رفض إعلان', tone: 'red' },
  'ad.pause': { label: 'إيقاف إعلان', tone: 'gold' },
  'ad.resume': { label: 'استئناف إعلان', tone: 'teal' },
  'ad.delete': { label: 'حذف إعلان', tone: 'red' },
  'features.update': { label: 'تحديث الميزات', tone: 'purple' },
  'texts.update': { label: 'تحديث النصوص', tone: 'purple' },
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ar-EG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type Props = {
  q?: string
  action?: string
  actor?: string
}

export default async function AuditSection({ q: qRaw, action, actor }: Props) {
  const q = (qRaw ?? '').trim().toLowerCase()
  const actionFilter = action ?? ''
  const actorFilter = actor ?? ''

  const [logs, stats] = await Promise.all([getAuditLogs(300), getAuditStats()])

  let filtered = logs
  if (actionFilter) filtered = filtered.filter((l) => l.action === actionFilter)
  if (actorFilter) filtered = filtered.filter((l) => l.actor_user_id === actorFilter)
  if (q) {
    filtered = filtered.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        (l.actor?.display_name ?? '').toLowerCase().includes(q) ||
        (l.entity_type ?? '').toLowerCase().includes(q),
    )
  }

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action))).sort()
  const actorsMap = new Map<string, string>()
  for (const l of logs) {
    if (l.actor_user_id && l.actor?.display_name) {
      actorsMap.set(l.actor_user_id, l.actor.display_name)
    }
  }
  const uniqueActors = Array.from(actorsMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'))

  return (
    <>
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>
            <FileTextIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.total.toLocaleString('ar-EG')}</span>
            <span className={styles.statLabel}>إجمالي</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${stats.today > 0 ? styles.statWarn : ''}`}>
          <span className={`${styles.statIcon} ${styles.iconWarn}`}>
            <ClockIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.today}</span>
            <span className={styles.statLabel}>اليوم</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statOk}`}>
          <span className={`${styles.statIcon} ${styles.iconOk}`}>
            <TrendingUpIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.thisWeek}</span>
            <span className={styles.statLabel}>آخر 7 أيام</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statGold}`}>
          <span className={`${styles.statIcon} ${styles.iconGold}`}>
            <UserIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.uniqueActors}</span>
            <span className={styles.statLabel}>أدمن نشط</span>
          </div>
        </div>
      </section>

      <AuditFilters actions={uniqueActions} actors={uniqueActors} />

      {filtered.length === 0 ? (
        <EmptyState
          Icon={q || actionFilter || actorFilter ? AlertIcon : FileTextIcon}
          title={logs.length === 0 ? 'مفيش عمليات لسه' : 'مفيش نتائج للفلتر'}
          description={
            logs.length === 0
              ? 'أي عملية إدارية هتتسجل هنا تلقائياً'
              : 'جرّب فلتر تاني أو امسح البحث'
          }
        />
      ) : (
        <div className={styles.list}>
          {filtered.map((log) => {
            const meta = ACTION_LABEL[log.action] ?? {
              label: log.action,
              tone: 'neutral',
            }
            return (
              <article key={log.id} className={styles.row}>
                <div className={styles.rowHead}>
                  <span className={`${styles.badge} ${styles[meta.tone]}`}>{meta.label}</span>
                  <time className={styles.date}>
                    <ClockIcon size={11} />
                    {fmtDate(log.created_at)}
                  </time>
                </div>

                <div className={styles.rowBody}>
                  <div className={styles.actor}>
                    <span className={styles.actorLabel}>بواسطة:</span>
                    <strong className={styles.actorName}>
                      {log.actor?.display_name ?? 'نظام'}
                    </strong>
                  </div>

                  {log.entity_type && (
                    <div className={styles.entity}>
                      <span className={styles.entityLabel}>{log.entity_type}</span>
                      {log.entity_id && (
                        <code className={styles.entityId}>{log.entity_id.slice(0, 8)}</code>
                      )}
                    </div>
                  )}
                </div>

                {Object.keys(log.metadata).length > 0 && (
                  <details className={styles.meta}>
                    <summary>التفاصيل</summary>
                    <pre className={styles.metaPre}>{JSON.stringify(log.metadata, null, 2)}</pre>
                  </details>
                )}
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
