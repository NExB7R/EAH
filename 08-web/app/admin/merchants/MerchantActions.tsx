'use client'
import { useState, useTransition } from 'react'
import { reviewMerchantApp } from './actions'
import { IcCheckCircle } from '@/components/eah-icons'

export default function MerchantActions({ id }: { id: string }) {
  const [pending, start] = useTransition()
  const [mode, setMode] = useState<'idle' | 'reject'>('idle')
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function approve() {
    start(async () => {
      const r = await reviewMerchantApp(id, 'approved', '')
      setMsg(r.ok ? 'تم القبول' : ` ${r.error}`)
      if (r.ok) setDone(true)
    })
  }

  function reject() {
    if (!note.trim()) return
    start(async () => {
      const r = await reviewMerchantApp(id, 'rejected', note)
      setMsg(r.ok ? 'تم الرفض' : ` ${r.error}`)
      if (r.ok) {
        setDone(true)
        setMode('idle')
        setNote('')
      }
    })
  }

  if (done) {
    return (
      <div className="mrch-actions mrch-actions--done">
        <span>{msg}</span>
      </div>
    )
  }

  return (
    <div className="mrch-actions">
      {mode === 'idle' ? (
        <>
          <button
            type="button"
            className="mrch-btn mrch-btn--approve"
            onClick={approve}
            disabled={pending}
          >
            {pending ? '...' : 'قبول التاجر'}
          </button>
          <button
            type="button"
            className="mrch-btn mrch-btn--reject"
            onClick={() => setMode('reject')}
            disabled={pending}
          >
            ✖ رفض
          </button>
          {msg && <span className="mrch-actions__msg">{msg}</span>}
        </>
      ) : (
        <div className="mrch-reject-box">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="سبب الرفض (إلزامي)"
            maxLength={300}
            rows={2}
          />
          <div className="mrch-reject-box__actions">
            <button
              type="button"
              className="mrch-btn mrch-btn--danger"
              onClick={reject}
              disabled={pending || !note.trim()}
            >
              {pending ? '...' : 'تأكيد الرفض'}
            </button>
            <button
              type="button"
              className="mrch-btn mrch-btn--ghost"
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
