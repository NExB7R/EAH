'use client'
import { useState } from 'react'
import { IcCalendar, IcTrash } from '@/components/eah-icons'

type Log = {
  id: string
  actor_user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  before_data: any
  after_data: any
  metadata: any
  reviewed_by?: string | null
  reviewed_at?: string | null
  review_note?: string | null
  created_at: string
}

const ACTION_LABEL: Record<string, string> = {
  'business.create': 'إضافة نشاط',
  'business.update': 'تعديل نشاط',
  'business.delete': 'حذف نشاط',
  'business.toggle_featured': 'تبديل المميز',
  'business.toggle_published': 'تبديل النشر',
  'subscription.requested': ' طلب اشتراك',
  'subscription.approved': 'اعتماد اشتراك',
  'subscription.rejected': 'رفض اشتراك',
  'subscription.cancelled': '⏸ إلغاء اشتراك',
  'subscription.expired': '⏹ انتهاء اشتراك',
  'user.ban': 'حظر مستخدم',
  'user.unban': 'فك حظر',
  'user.role_change': 'تغيير دور',
  'review.approve': 'اعتماد تقييم',
  'review.reject': 'رفض تقييم',
  'offer.approve': 'اعتماد عرض',
  'offer.reject': 'رفض عرض',
  'points.adjust': 'تعديل نقاط',
  'business.update.approved': 'اعتماد تعديل نشاط',
  'business.update.rejected': 'رفض تعديل نشاط',
  'business.delete.approved': 'اعتماد حذف نشاط',
  'business.delete.rejected': 'رفض حذف نشاط',
  'review.delete.approved': 'اعتماد حذف تقييم',
  'review.delete.rejected': 'رفض حذف تقييم',
  'profile.update.approved': 'اعتماد تعديل بروفايل',
  'profile.update.rejected': 'رفض تعديل بروفايل',
}

function getColorClass(action: string): string {
  if (action.includes('delete') || action.includes('ban') || action.includes('reject')) return 'danger'
  if (action.includes('create') || action.includes('approve') || action.includes('unban')) return 'success'
  if (action.includes('update') || action.includes('toggle')) return 'warning'
  return ''
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `${mins} دقيقة`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} ساعة`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} يوم`
  return new Date(iso).toLocaleDateString('ar-EG')
}

export default function AuditItem({ log, actorName, reviewerName }: { log: Log; actorName?: string; reviewerName?: string }) {
  const [expanded, setExpanded] = useState(false)
  const hasDetails =
    log.before_data || log.after_data || (log.metadata && Object.keys(log.metadata).length > 0)
  const colorClass = getColorClass(log.action)

  return (
    <div className={`aud-item ${colorClass ? `aud-item--${colorClass}` : ''}`}>
      <div className="aud-item__head">
        <div className="aud-item__title">
          <span className="aud-item__action">{ACTION_LABEL[log.action] ?? log.action}</span>
          {log.entity_type && (
            <span className="aud-item__entity">{log.entity_type}</span>
          )}
        </div>
        <span className="aud-item__time">{timeAgo(log.created_at)}</span>
      </div>

      <div className="aud-item__meta">
        <span className="aud-item__chip">{actorName ?? 'النظام'}</span>
        {log.entity_id && (
          <span className="aud-item__chip">
            {log.entity_id.slice(0, 8)}...
          </span>
        )}
        <span className="aud-item__chip"><IcCalendar /> {new Date(log.created_at).toLocaleString('ar-EG')}
        </span>
        {log.reviewed_by && reviewerName && (
          <span className="aud-item__chip aud-item__chip--review">راجعه: {reviewerName}</span>
        )}
      </div>

      {log.review_note && (
        <div className="aud-item__note">
          <strong>ملاحظة المراجعة:</strong> {log.review_note}
        </div>
      )}

      {hasDetails && (
        <>
          <button
            className="aud-item__expand"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '▼ إخفاء التفاصيل' : '▶ عرض التفاصيل'}
          </button>
          {expanded && (
            <div className="aud-item__detail">
              {log.before_data && (
                <>
                  <div className="aud-item__detail-title">Before</div>
                  <pre>{JSON.stringify(log.before_data, null, 2)}</pre>
                </>
              )}
              {log.after_data && (
                <>
                  <div className="aud-item__detail-title" style={{ marginTop: 10 }}>After</div>
                  <pre>{JSON.stringify(log.after_data, null, 2)}</pre>
                </>
              )}
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <>
                  <div className="aud-item__detail-title" style={{ marginTop: 10 }}>Metadata</div>
                  <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
