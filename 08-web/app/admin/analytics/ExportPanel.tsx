'use client'
import { useState } from 'react'

const TYPES = [
  { key: 'businesses', label: '🏪 الأنشطة' },
  { key: 'reviews', label: '✍️ التقييمات' },
  { key: 'reveals', label: '📞 كشوف الأرقام' },
  { key: 'users', label: '👥 المستخدمون' },
  { key: 'visits', label: '📅 الزيارات' },
  { key: 'referrals', label: '🎁 الإحالات' },
  { key: 'audit', label: '📋 سجل العمليات' },
]

export default function ExportPanel() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  function buildHref(type: string) {
    const params = new URLSearchParams({ type })
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return `/api/admin/export?${params.toString()}`
  }

  function setQuick(days: number) {
    const end = new Date()
    const start = new Date(Date.now() - days * 86400000)
    setFrom(start.toISOString().slice(0, 10))
    setTo(end.toISOString().slice(0, 10))
  }

  return (
    <div className="exp">
      <div className="exp__range">
        <div className="exp__quick">
          <button type="button" onClick={() => setQuick(7)} className="exp__quick-btn">آخر 7 أيام</button>
          <button type="button" onClick={() => setQuick(30)} className="exp__quick-btn">آخر 30 يوم</button>
          <button type="button" onClick={() => setQuick(90)} className="exp__quick-btn">آخر 3 شهور</button>
          <button type="button" onClick={() => { setFrom(''); setTo('') }} className="exp__quick-btn exp__quick-btn--ghost">مسح</button>
        </div>
        <div className="exp__dates">
          <label className="exp__date">
            <span>من</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="exp__date">
            <span>إلى</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="exp__grid">
        {TYPES.map((t) => (
          <a key={t.key} href={buildHref(t.key)} className="exp__btn">
            {t.label}
            <span className="exp__arrow">↓</span>
          </a>
        ))}
      </div>
    </div>
  )
}
