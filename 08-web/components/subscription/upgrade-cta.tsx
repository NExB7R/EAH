'use client'
import { useState } from 'react'
import './upgrade-cta.css'
import { IcAlert, IcCheckCircle } from '@/components/eah-icons'

export default function UpgradeCTA({
  businessId,
  plans,
  currentPlanCode,
}: {
  businessId: string
  plans: { id: string; code: string; name_ar: string; duration_days: number; price_egp: number | null; description: string | null; features: string[] }[]
  currentPlanCode?: string | null
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!selected) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/merchant/subscription/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, planId: selected, notes }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'حصل خطأ، جرب تاني')
      } else {
        setDone(true)
      }
    } catch {
      setError('حصل خطأ في الاتصال')
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="ucta ucta--success">
        <span className="ucta__emoji"><IcCheckCircle /></span>
        <h3>تم إرسال طلبك</h3>
        <p>الإدارة هتراجعه وترد عليك في أقرب وقت.</p>
      </div>
    )
  }

  return (
    <div className="ucta">
      <h3 className="ucta__title">⬆️ ارقى لباقة مميزة</h3>
      <p className="ucta__sub">
        شارة مميز + أولوية في البحث + إعلانات + معرض عروض
      </p>

      <div className="ucta__plans">
        {plans.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`ucta__plan ${selected === p.id ? 'is-selected' : ''} ${currentPlanCode === p.code ? 'is-current' : ''}`}
            onClick={() => setSelected(p.id)}
            disabled={currentPlanCode === p.code}
          >
            <div className="ucta__plan-head">
              <strong>{p.name_ar}</strong>
              {currentPlanCode === p.code && <span className="ucta__current-tag">الحالية</span>}
            </div>
            {p.description && <small>{p.description}</small>}
            <div className="ucta__plan-meta">
              <span>⏱ {p.duration_days} يوم</span>
              <span>{p.price_egp === null ? ' تواصل معنا' : ` ${p.price_egp} ج.م`}</span>
            </div>
          </button>
        ))}
      </div>

      <textarea
        className="ucta__notes"
        placeholder="ملاحظات إضافية (اختياري)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={500}
        rows={2}
      />

      {error && <p className="ucta__error"><IcAlert /> {error}</p>}

      <button
        className="ucta__btn"
        onClick={submit}
        disabled={!selected || sending}
      >
        {sending ? '...' : 'إرسال الطلب'}
      </button>
    </div>
  )
}
