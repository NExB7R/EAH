'use client'
import { useState, useTransition } from 'react'
import { reviewVerification } from './actions'

type Request = {
  id: string
  real_name: string
  national_id: string | null
  reason: string | null
  status: string
  admin_note: string | null
  created_at: string
  profile?: { display_name: string; phone: string; trust_score: number; created_at: string } | null
}

export default function VerificationCard({
  request,
  readOnly = false,
}: {
  request: Request
  readOnly?: boolean
}) {
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const act = (action: 'approve' | 'reject') => {
    startTransition(async () => {
      const res = await reviewVerification(request.id, action, note)
      if (!res.ok) setMsg(res.message ?? 'حصل خطأ')
    })
  }

  return (
    <article className={`vf-card ${readOnly ? 'vf-card--done' : ''}`}>
      <div className="vf-card__head">
        <div>
          <h3 className="vf-card__name">{request.real_name}</h3>
          <span className="vf-card__meta">
            @{request.profile?.display_name ?? '—'} · {request.profile?.phone ?? '—'}
          </span>
        </div>
        <span className={`vf-card__status vf-card__status--${request.status}`}>
          {request.status === 'pending' && '⏳ معلق'}
          {request.status === 'approved' && '✅ مقبول'}
          {request.status === 'rejected' && '❌ مرفوض'}
        </span>
      </div>

      {request.national_id && (
        <div className="vf-card__row">
          <span className="vf-card__label">الرقم القومي</span>
          <span className="vf-card__value" dir="ltr">{request.national_id}</span>
        </div>
      )}

      {request.reason && (
        <div className="vf-card__row">
          <span className="vf-card__label">السبب</span>
          <p className="vf-card__value">{request.reason}</p>
        </div>
      )}

      <div className="vf-card__row">
        <span className="vf-card__label">تاريخ الطلب</span>
        <span className="vf-card__value">
          {new Date(request.created_at).toLocaleString('ar-EG')}
        </span>
      </div>

      {!readOnly && (
        <>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="ملاحظة (اختياري)"
            maxLength={200}
            rows={2}
            className="vf-card__note"
          />
          <div className="vf-card__actions">
            <button
              type="button"
              onClick={() => act('reject')}
              disabled={isPending}
              className="vf-card__btn vf-card__btn--reject"
            >
              ❌ رفض
            </button>
            <button
              type="button"
              onClick={() => act('approve')}
              disabled={isPending}
              className="vf-card__btn vf-card__btn--approve"
            >
              {isPending ? '...' : '✅ قبول'}
            </button>
          </div>
        </>
      )}

      {readOnly && request.admin_note && (
        <p className="vf-card__admin-note">💬 {request.admin_note}</p>
      )}

      {msg && <p className="vf-card__msg">{msg}</p>}
    </article>
  )
}
