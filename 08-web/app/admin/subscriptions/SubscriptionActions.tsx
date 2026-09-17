'use client'
import { useState, useTransition } from 'react'
import { approveAction, rejectAction, cancelAction } from './actions'
import type { SubscriptionPlan } from '@/lib/subscription'

export default function SubscriptionActions({
  id,
  status,
  plans,
}: {
  id: string
  status: string
  plans: SubscriptionPlan[]
}) {
  const [pending, start] = useTransition()
  const [mode, setMode] = useState<'idle' | 'reject' | 'cancel'>('idle')
  const [reason, setReason] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  function doApprove(trial: boolean) {
    start(async () => {
      const r = await approveAction(id, trial)
      setMsg(r.ok ? 'تم التفعيل' : `${r.error}`)
    })
  }
  function doReject() {
    if (!reason.trim()) return
    start(async () => {
      const r = await rejectAction(id, reason.trim())
      setMsg(r.ok ? 'تم الرفض' : `${r.error}`)
      setMode('idle')
      setReason('')
    })
  }
  function doCancel() {
    start(async () => {
      const r = await cancelAction(id, reason.trim() || undefined)
      setMsg(r.ok ? 'تم الإلغاء' : `${r.error}`)
      setMode('idle')
      setReason('')
    })
  }

  return (
    <div className="sub-actions">
      {status === 'pending' && (
        <>
          <button
            className="sub-btn sub-btn--primary"
            onClick={() => doApprove(true)}
            disabled={pending}
          >
            {pending ? '...' : 'موافقة + 30 يوم تجريبي'}
          </button>
          <button
            className="sub-btn sub-btn--primary-2"
            onClick={() => doApprove(false)}
            disabled={pending}
          >
            تفعيل مباشر
          </button>
          <button
            className="sub-btn sub-btn--danger"
            onClick={() => setMode('reject')}
            disabled={pending}
          >
            رفض
          </button>
        </>
      )}

      {(status === 'trial' || status === 'active') && (
        <button
          className="sub-btn sub-btn--danger"
          onClick={() => setMode('cancel')}
          disabled={pending}
        >
          ⏸ إيقاف الاشتراك
        </button>
      )}

      {mode === 'reject' && (
        <div className="sub-modal">
          <textarea
            placeholder="سبب الرفض (إلزامي)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            maxLength={300}
          />
          <div className="sub-modal__actions">
            <button className="sub-btn sub-btn--danger" onClick={doReject} disabled={!reason.trim() || pending}>
              تأكيد الرفض
            </button>
            <button className="sub-btn" onClick={() => { setMode('idle'); setReason('') }}>إلغاء</button>
          </div>
        </div>
      )}

      {mode === 'cancel' && (
        <div className="sub-modal">
          <textarea
            placeholder="سبب الإيقاف (اختياري)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            maxLength={300}
          />
          <div className="sub-modal__actions">
            <button className="sub-btn sub-btn--danger" onClick={doCancel} disabled={pending}>
              تأكيد الإيقاف
            </button>
            <button className="sub-btn" onClick={() => { setMode('idle'); setReason('') }}>إلغاء</button>
          </div>
        </div>
      )}

      {msg && <p className="sub-actions__msg">{msg}</p>}
    </div>
  )
}
