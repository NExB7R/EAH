'use client'

import { useState, useTransition } from 'react'
import { CheckCircleIcon, AlertIcon, CloseIcon, TargetIcon } from '@/components/icons'
import { updateReportStatus } from './actions'
import styles from './reports.module.css'

type Report = {
  id: string
  entity_type: string
  entity_id: string | null
  reason: string
  note: string | null
  status: string
  admin_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
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
  سبام: 'سبام',
  'محتوى مسيء': 'محتوى مسيء',
  'محتوى مزيّف': 'محتوى مزيّف',
  'تحرش/إساءة': 'تحرش/إساءة',
  'معلومات غلط': 'معلومات غلط',
  'سبب آخر': 'سبب آخر',
}

export default function ReportRow({ report }: Props) {
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState(report.status)
  const [adminNote, setAdminNote] = useState(report.admin_note ?? '')
  const [msg, setMsg] = useState<string | null>(null)

  const date = new Date(report.created_at).toLocaleString('ar-EG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const handle = (next: string) => {
    if ((next === 'resolved' || next === 'dismissed') && adminNote.trim().length < 3) {
      setMsg('اكتب سبب قرار الأدمن قبل إغلاق البلاغ')
      return
    }
    startTransition(async () => {
      const res = await updateReportStatus(report.id, next, adminNote)
      if (res.ok) {
        setStatus(next)
        setMsg('تم التحديث')
        setTimeout(() => setMsg(null), 2500)
      } else {
        setMsg(res.error)
      }
    })
  }

  const isOpen = status === 'pending' || status === 'reviewing'

  return (
    <article className={`${styles.row} ${!isOpen ? styles.rowClosed : ''}`}>
      <div className={styles.rowHead}>
        <span className={styles.targetBadge}>
          <TargetIcon size={11} />
          {TARGET_LABEL[report.entity_type] ?? report.entity_type}
        </span>
        <time className={styles.date}>{date}</time>
      </div>

      <div className={styles.rowBody}>
        <div className={styles.reason}>
          <span className={styles.reasonLabel}>السبب:</span>
          <strong>{REASON_LABEL[report.reason] ?? report.reason}</strong>
        </div>

        {report.note && <p className={styles.details}>{report.note}</p>}

        <div className={styles.meta}>
          <span>
            بواسطة: <strong>{report.reporter?.display_name ?? '—'}</strong>
          </span>
          <span className={styles.sep}>·</span>
          <code className={styles.targetId}>{report.entity_id?.slice(0, 8) ?? '—'}</code>
        </div>
      </div>

      {isOpen ? (
        <div className={styles.actions}>
          <textarea
            className={styles.adminNoteInput}
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            placeholder="سبب قرار الأدمن (مطلوب عند التأكيد أو الرفض)"
            aria-label="سبب قرار الأدمن"
            maxLength={500}
            rows={2}
            disabled={pending}
          />
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
            <span>تأكيد البلاغ واتخاذ إجراء</span>
          </button>
          <button
            type="button"
            onClick={() => handle('dismissed')}
            disabled={pending}
            className={`${styles.btn} ${styles.btnDismiss}`}
          >
            <CloseIcon size={12} />
            <span>البلاغ غير مثبت</span>
          </button>
        </div>
      ) : (
        <div
          className={`${styles.statusBadge} ${status === 'resolved' ? styles.resolved : styles.dismissed}`}
        >
          {status === 'resolved' ? 'تم التحقق واتخاذ إجراء' : 'البلاغ غير مثبت'}
          {adminNote && <p className={styles.adminDecision}>{adminNote}</p>}
        </div>
      )}

      {msg && <p className={styles.msg}>{msg}</p>}
    </article>
  )
}
