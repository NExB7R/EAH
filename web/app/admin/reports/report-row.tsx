'use client'

import { useState, useTransition } from 'react'
import { CheckCircleIcon, AlertIcon, CloseIcon, TargetIcon } from '@/components/icons'
import { updateReportStatus } from './actions'
import styles from './reports.module.css'

type Report = {
  id: string
  target_type: string
  target_id: string
  reason: string
  details: string | null
  status: string
  created_at: string
  reporter: { display_name: string } | null
}

type Props = {
  report: Report
}

const TARGET_LABEL: Record<string, string> = {
  business: 'نشاط',
  review: 'تقييم',
  user: 'مستخدم',
  offer: 'عرض',
}

const REASON_LABEL: Record<string, string> = {
  spam: 'سبام',
  abuse: 'إساءة',
  fake: 'محتوى مزيف',
  inappropriate: 'محتوى غير لائق',
  other: 'أخرى',
}

export default function ReportRow({ report }: Props) {
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState(report.status)
  const [msg, setMsg] = useState<string | null>(null)

  const date = new Date(report.created_at).toLocaleString('ar-EG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const handle = (next: string) => {
    startTransition(async () => {
      const res = await updateReportStatus(report.id, next)
      if (res.ok) {
        setStatus(next)
        setMsg('تم التحديث')
        setTimeout(() => setMsg(null), 2500)
      } else {
        setMsg(res.error)
      }
    })
  }

  const isOpen = status === 'open' || status === 'reviewing'

  return (
    <article className={`${styles.row} ${!isOpen ? styles.rowClosed : ''}`}>
      <div className={styles.rowHead}>
        <span className={styles.targetBadge}>
          <TargetIcon size={11} />
          {TARGET_LABEL[report.target_type] ?? report.target_type}
        </span>
        <time className={styles.date}>{date}</time>
      </div>

      <div className={styles.rowBody}>
        <div className={styles.reason}>
          <span className={styles.reasonLabel}>السبب:</span>
          <strong>{REASON_LABEL[report.reason] ?? report.reason}</strong>
        </div>

        {report.details && <p className={styles.details}>{report.details}</p>}

        <div className={styles.meta}>
          <span>
            بواسطة: <strong>{report.reporter?.display_name ?? '—'}</strong>
          </span>
          <span className={styles.sep}>·</span>
          <code className={styles.targetId}>{report.target_id.slice(0, 8)}</code>
        </div>
      </div>

      {isOpen ? (
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => handle('reviewing')}
            disabled={pending || status === 'reviewing'}
            className={`${styles.btn} ${styles.btnReview}`}
          >
            <AlertIcon size={12} />
            <span>مراجعة</span>
          </button>
          <button
            type="button"
            onClick={() => handle('resolved')}
            disabled={pending}
            className={`${styles.btn} ${styles.btnOk}`}
          >
            <CheckCircleIcon size={12} />
            <span>تم الحل</span>
          </button>
          <button
            type="button"
            onClick={() => handle('dismissed')}
            disabled={pending}
            className={`${styles.btn} ${styles.btnDismiss}`}
          >
            <CloseIcon size={12} />
            <span>رفض</span>
          </button>
        </div>
      ) : (
        <div
          className={`${styles.statusBadge} ${status === 'resolved' ? styles.resolved : styles.dismissed}`}
        >
          {status === 'resolved' ? 'تم الحل' : 'مرفوض'}
        </div>
      )}

      {msg && <p className={styles.msg}>{msg}</p>}
    </article>
  )
}
