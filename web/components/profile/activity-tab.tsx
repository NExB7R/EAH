'use client'

import { UserIcon, CheckCircleIcon, ShieldCheckIcon, ClockIcon } from '@/components/icons'
import type { AuditEvent } from '@/lib/data/audit'
import styles from './profile-tabs.module.css'

type Props = { events: AuditEvent[] }

const ACTION_LABELS: Record<string, { label: string; icon: 'user' | 'check' | 'shield' }> = {
  'profile.name_update': { label: 'تحديث الاسم', icon: 'user' },
  'profile.avatar_upload': { label: 'رفع صورة جديدة', icon: 'user' },
  'profile.avatar_delete': { label: 'حذف الصورة', icon: 'user' },
  'review.created': { label: 'مراجعة جديدة', icon: 'check' },
  'review.status_changed': { label: 'تغيير حالة المراجعة', icon: 'check' },
  'business.upload_media': { label: 'رفع وسائط للنشاط', icon: 'check' },
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-EG', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function ActivityTab({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className={styles.tabPanel}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <ClockIcon size={32} />
          </span>
          <h3 className={styles.emptyTitle}>سجل النشاط</h3>
          <p className={styles.emptyDesc}>
            هيظهر هنا كل حدث أمني أو إداري: تعديلات الملف، تغيير الصور، والعمليات الإدارية.
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className={styles.tabPanel}>
      <div className={styles.activityList}>
        {events.map((e) => {
          const meta = ACTION_LABELS[e.action] ?? { label: e.action, icon: 'shield' as const }
          return (
            <div key={e.id} className={styles.activityItem}>
              <span className={styles.activityIcon}>
                {meta.icon === 'user' ? (
                  <UserIcon size={16} />
                ) : meta.icon === 'check' ? (
                  <CheckCircleIcon size={16} />
                ) : (
                  <ShieldCheckIcon size={16} />
                )}
              </span>
              <div className={styles.activityBody}>
                <span className={styles.activityLabel}>{meta.label}</span>
                <span className={styles.activityTime}>{formatTime(e.created_at)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
