import { FileTextIcon, ClockIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { getAuditLogs } from '@/lib/data/admin'
import styles from './audit.module.css'

export const dynamic = 'force-dynamic'

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
}

export default async function AdminAuditPage() {
  const logs = await getAuditLogs(150)

  return (
    <div>
      <AccountPageHeader title="سجل التدقيق" description={`${logs.length} عملية إدارية`} />

      {logs.length === 0 ? (
        <EmptyState
          Icon={FileTextIcon}
          title="مفيش عمليات لسه"
          description="أي عملية إدارية هتتسجل هنا تلقائياً"
        />
      ) : (
        <div className={styles.list}>
          {logs.map((log) => {
            const meta = ACTION_LABEL[log.action] ?? {
              label: log.action,
              tone: 'neutral',
            }
            const date = new Date(log.created_at).toLocaleString('ar-EG', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <article key={log.id} className={styles.row}>
                <div className={styles.rowHead}>
                  <span className={`${styles.badge} ${styles[meta.tone]}`}>{meta.label}</span>
                  <time className={styles.date}>
                    <ClockIcon size={11} />
                    {date}
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
    </div>
  )
}
