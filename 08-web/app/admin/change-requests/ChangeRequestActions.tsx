'use client'
import { useState, useTransition } from 'react'
import { reviewRequestAction } from './actions'

export default function ChangeRequestActions({ id }: { id: string }) {
  const [pending, start] = useTransition()
  const [mode, setMode] = useState<'idle' | 'reject'>('idle')
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function approve() {
    start(async () => {
      const r = await reviewRequestAction(id, 'approved', '')
      setMsg(r.ok ? '✅ تم الاعتماد' : `⚠ ${r.error}`)
      if (r.ok) setDone(true)
    })
  }

  function reject() {
    if (!note.trim()) return
    start(async () => {
      const r = await reviewRequestAction(id, 'rejected', note)
      setMsg(r.ok ? 'تم الرفض' : `⚠ ${r.error}`)
      if (r.ok) {
        setDone(true)
        setMode('idle')
        setNote('')
      }
    })
  }

  if (done) {
    return (
      <div className="cr-actions cr-actions--done">
        <span>{msg}</span>
      </div>
    )
  }

  return (
    <div className="cr-actions">
      {mode === 'idle' ? (
        <>
          <button
            type="button"
            className="cr-btn cr-btn--approve"
            onClick={approve}
            disabled={pending}
          >
            {pending ? '...' : '✅ اعتماد'}
          </button>
          <button
            type="button"
            className="cr-btn cr-btn--reject"
            onClick={() => setMode('reject')}
            disabled={pending}
          >
            ✖ رفض
          </button>
          {msg && <span className="cr-actions__msg">{msg}</span>}
        </>
      ) : (
        <div className="cr-reject-box">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="سبب الرفض (إلزامي)"
            maxLength={300}
            rows={2}
          />
          <div className="cr-reject-box__actions">
            <button
              type="button"
              className="cr-btn cr-btn--danger"
              onClick={reject}
              disabled={pending || !note.trim()}
            >
              {pending ? '...' : 'تأكيد الرفض'}
            </button>
            <button
              type="button"
              className="cr-btn cr-btn--ghost"
              onClick={() => { setMode('idle'); setNote('') }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
