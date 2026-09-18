'use client'
import { useState, useTransition } from 'react'
import { approveAction, rejectAction } from './actions'
import { IcCheck, IcBan, IcChat, IcUser } from '@/components/eah-icons'

type Item = {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  payload: any
  before_data: any
  requested_by: string
  created_at: string
  requester_name: string | null
  requester_phone: string | null
}

const ACTION_LABEL: Record<string, string> = {
  'business.update': 'تعديل نشاط',
  'business.delete': 'حذف نشاط',
  'business.images_change': 'تغيير صور',
  'review.hide': 'إخفاء تقييم',
  'review.delete': 'حذف تقييم',
  'offer.update': 'تعديل عرض',
  'offer.delete': 'حذف عرض',
  'profile.update': 'تعديل بروفايل',
}

function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime()
  const m = Math.floor(d / 60000)
  if (m < 1) return 'الآن'
  if (m < 60) return `قبل ${m} د`
  const h = Math.floor(m / 60)
  if (h < 24) return `قبل ${h} س`
  return `قبل ${Math.floor(h / 24)} يوم`
}

export default function PendingClient({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <div className="adp-empty">
        <IcCheck />
        <h3>مفيش طلبات معلقة</h3>
        <p>كل حاجة تحت السيطرة.</p>
      </div>
    )
  }

  return (
    <div className="adp-list">
      {items.map(item => (
        <PendingRow key={item.id} item={item} />
      ))}
    </div>
  )
}

function PendingRow({ item }: { item: Item }) {
  const [mode, setMode] = useState<'idle' | 'approve' | 'reject'>('idle')
  const [note, setNote] = useState('')
  const [pending, start] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [done, setDone] = useState(false)

  function handleApprove() {
    start(async () => {
      const r = await approveAction(item.id, note)
      if (r.ok) {
        setResult({ ok: true, msg: 'تم الاعتماد' })
        setDone(true)
      } else {
        setResult({ ok: false, msg: r.error ?? 'فشل' })
      }
    })
  }

  function handleReject() {
    start(async () => {
      const r = await rejectAction(item.id, note)
      if (r.ok) {
        setResult({ ok: true, msg: 'تم الرفض' })
        setDone(true)
      } else {
        setResult({ ok: false, msg: r.error ?? 'فشل' })
      }
    })
  }

  if (done) return null

  return (
    <div className="adp-row">
      <header className="adp-row__head">
        <div>
          <span className="adp-row__action">{ACTION_LABEL[item.action] ?? item.action}</span>
          <span className="adp-row__entity">{item.entity_type}</span>
        </div>
        <span className="adp-row__time">{timeAgo(item.created_at)}</span>
      </header>

      <div className="adp-row__requester">
        <IcUser />
        <strong>{item.requester_name ?? 'مستخدم'}</strong>
        {item.requester_phone && <span dir="ltr">{item.requester_phone}</span>}
      </div>

      <details className="adp-row__payload">
        <summary>عرض تفاصيل الطلب</summary>
        <pre>{JSON.stringify(item.payload, null, 2)}</pre>
      </details>

      {mode === 'idle' && (
        <div className="adp-row__actions">
          <button type="button" className="adp-btn adp-btn--ok" onClick={() => setMode('approve')}>
            <IcCheck /> اعتماد
          </button>
          <button type="button" className="adp-btn adp-btn--no" onClick={() => setMode('reject')}>
            <IcBan /> رفض
          </button>
        </div>
      )}

      {mode !== 'idle' && (
        <div className="adp-row__confirm">
          <div className={`adp-confirm-head adp-confirm-head--${mode}`}>
            {mode === 'approve' ? 'اعتماد الطلب' : 'رفض الطلب'}
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={mode === 'approve' ? 'ملاحظة (اختياري)' : 'سبب الرفض (اختياري)'}
            rows={2}
          />
          <div className="adp-row__actions">
            <button type="button" className="adp-btn adp-btn--ghost" onClick={() => setMode('idle')} disabled={pending}>
              إلغاء
            </button>
            {mode === 'approve' ? (
              <button type="button" className="adp-btn adp-btn--ok" onClick={handleApprove} disabled={pending}>
                {pending ? '...' : <><IcCheck /> تأكيد الاعتماد</>}
              </button>
            ) : (
              <button type="button" className="adp-btn adp-btn--no" onClick={handleReject} disabled={pending}>
                {pending ? '...' : <><IcBan /> تأكيد الرفض</>}
              </button>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className={`adp-result ${result.ok ? 'is-ok' : 'is-err'}`}>
          {result.msg}
        </div>
      )}
    </div>
  )
}
