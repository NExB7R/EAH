'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './report-button.css'

const REASONS = [
  { key: 'spam', label: 'محتوى مكرر / سبام' },
  { key: 'fake', label: 'معلومات غلط' },
  { key: 'abuse', label: 'إساءة أو محتوى غير لائق' },
  { key: 'closed', label: 'المكان اتقفل' },
  { key: 'other', label: 'سبب تاني' },
]

export default function ReportButton({ entityType, entityId }: { entityType: string; entityId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(false)
  const [pending, start] = useTransition()

  function submit() {
    if (!reason) { setMsg('اختار سبب'); return }
    start(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setMsg('سجل دخول الأول'); return }
      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        reason,
        note: note || null,
      })
      if (error) { setMsg(error.message); return }
      setDone(true)
      setMsg('✅ تم الإرسال، شكرًا!')
      setTimeout(() => { setOpen(false); setDone(false); setMsg(''); setReason(''); setNote('') }, 1800)
    })
  }

  if (!open) {
    return (
      <button type="button" className="rb-trigger" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true) }} title="إبلاغ" aria-label="إبلاغ">
        🚩
      </button>
    )
  }

  return (
    <div className="rb-modal" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false) }}>
      <div className="rb-card" onClick={e => e.stopPropagation()}>
        <h3 className="rb-title">🚩 إبلاغ</h3>
        <p className="rb-sub">ساعدنا نحسّن EAH</p>

        <div className="rb-reasons">
          {REASONS.map(r => (
            <button
              key={r.key}
              type="button"
              className={`rb-reason ${reason === r.key ? 'is-active' : ''}`}
              onClick={() => setReason(r.key)}
              disabled={done}
            >{r.label}</button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="ملاحظة (اختياري)"
          className="rb-textarea"
          maxLength={200}
          disabled={done}
        />

        {msg && <p className={`rb-msg ${done ? 'is-ok' : ''}`}>{msg}</p>}

        <div className="rb-actions">
          <button type="button" className="rb-btn rb-btn--ghost" onClick={() => setOpen(false)} disabled={done}>إلغاء</button>
          <button type="button" className="rb-btn rb-btn--primary" onClick={submit} disabled={pending || done}>
            {pending ? '...' : 'إرسال'}
          </button>
        </div>
      </div>
    </div>
  )
}
