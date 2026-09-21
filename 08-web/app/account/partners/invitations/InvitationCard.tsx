'use client'
import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptInvitation, rejectInvitation } from './actions'

const ROLE_META: Record<string, { label: string; desc: string; color: string }> = {
  manager: { label: 'مدير', desc: 'هتقدر تدير كل حاجة إلا الشركاء', color: 'purple' },
  editor: { label: 'محرر', desc: 'هتقدر تعدل البيانات وترفع صور', color: 'blue' },
  viewer: { label: 'مشاهد', desc: 'هتشوف التقارير بس', color: 'gray' },
}

export default function InvitationCard({
  partnerId,
  businessName,
  businessSlug,
  role,
  invitedAt,
  notes,
  invitedByName,
}: {
  partnerId: string
  businessName: string
  businessSlug: string
  role: string
  invitedAt: string
  notes: string | null
  invitedByName: string | null
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<'accepted' | 'rejected' | null>(null)

  const meta = ROLE_META[role] ?? ROLE_META.viewer

  function handleAccept() {
    setError(null)
    start(async () => {
      const res = await acceptInvitation(partnerId)
      if (!res.ok) { setError(res.message ?? 'خطأ'); return }
      setDone('accepted')
      setTimeout(() => router.refresh(), 800)
    })
  }

  function handleReject() {
    if (!confirm('متأكد ترفض الدعوة؟')) return
    setError(null)
    start(async () => {
      const res = await rejectInvitation(partnerId)
      if (!res.ok) { setError(res.message ?? 'خطأ'); return }
      setDone('rejected')
      setTimeout(() => router.refresh(), 800)
    })
  }

  if (done === 'accepted') {
    return (
      <div className="ic ic--done">
        <div className="ic__icon ic__icon--success">✓</div>
        <h3 className="ic__done-title">تم القبول! 🎉</h3>
        <p className="ic__done-msg">بقت شريك في {businessName} — هتلاقيها في لوحة النشاط</p>
      </div>
    )
  }

  if (done === 'rejected') {
    return (
      <div className="ic ic--done">
        <div className="ic__icon ic__icon--danger">×</div>
        <h3 className="ic__done-title">تم الرفض</h3>
        <p className="ic__done-msg">الدعوة اتلغت</p>
      </div>
    )
  }

  return (
    <article className={`ic ic--${meta.color}`}>
      <div className="ic__head">
        <div className="ic__avatar">🏪</div>
        <div className="ic__info">
          <span className="ic__kicker">دعوة للانضمام</span>
          <h3 className="ic__business">{businessName}</h3>
          {invitedByName && (
            <span className="ic__invited-by">من {invitedByName}</span>
          )}
        </div>
        <span className={`ic__role ic__role--${meta.color}`}>
          {meta.label}
        </span>
      </div>

      <p className="ic__desc">{meta.desc}</p>

      {notes && (
        <div className="ic__notes">
          <span className="ic__notes-label">📝 رسالة من صاحب النشاط:</span>
          <p className="ic__notes-text">{notes}</p>
        </div>
      )}

      <div className="ic__meta">
        <span className="ic__meta-item">
          📅 {new Date(invitedAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {error && <div className="ic__error">{error}</div>}

      <div className="ic__actions">
        <button
          type="button"
          className="ic__btn ic__btn--accept"
          onClick={handleAccept}
          disabled={pending}
        >
          {pending ? '...' : '✓ اقبل'}
        </button>
        <button
          type="button"
          className="ic__btn ic__btn--reject"
          onClick={handleReject}
          disabled={pending}
        >
          ✕ رفض
        </button>
      </div>
    </article>
  )
}
