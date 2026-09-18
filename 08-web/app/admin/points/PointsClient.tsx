'use client'
import { useState, useTransition } from 'react'
import { searchUsers, adjustPoints } from './actions'

type User = {
  id: string
  display_name: string | null
  phone: string | null
  trust_score: number
  streak_count: number
  role: string
  created_at: string
}

export default function PointsClient() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [searching, startSearch] = useTransition()
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<User | null>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearchError(null)
    startSearch(async () => {
      const r = await searchUsers(query)
      if (!r.ok) {
        setSearchError(r.error ?? 'فشل البحث')
        setUsers([])
        return
      }
      setUsers(r.users as User[])
    })
  }

  return (
    <>
      <form onSubmit={handleSearch} className="adp__search">
        <div className="adp__search-input">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="رقم الموبايل أو الاسم..."
            autoFocus
          />
        </div>
        <button type="submit" disabled={searching || query.trim().length < 2}>
          {searching ? '...' : 'ابحث'}
        </button>
      </form>

      {searchError && <div className="adp__err">{searchError}</div>}

      {users.length > 0 && (
        <div className="adp__list">
          {users.map(u => (
            <button
              key={u.id}
              type="button"
              className="adp__row"
              onClick={() => setSelected(u)}
            >
              <div className="adp__row-main">
                <strong>{u.display_name ?? 'بدون اسم'}</strong>
                <span className="adp__row-phone">{u.phone ?? '—'}</span>
              </div>
              <div className="adp__row-meta">
                <span className="adp__row-role">{u.role}</span>
                <span className="adp__row-balance">{u.trust_score} نقطة</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <AdjustModal
          user={selected}
          onClose={() => setSelected(null)}
          onUpdated={(newBalance) => {
            setUsers(us => us.map(u => u.id === selected.id ? { ...u, trust_score: newBalance } : u))
            setSelected(s => s ? { ...s, trust_score: newBalance } : null)
          }}
        />
      )}
    </>
  )
}

function AdjustModal({
  user, onClose, onUpdated,
}: {
  user: User
  onClose: () => void
  onUpdated: (newBalance: number) => void
}) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [mode, setMode] = useState<'add' | 'subtract'>('add')
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setSuccess(null)

    const num = parseInt(amount, 10)
    if (!num || num <= 0) { setErr('اكتب رقم أكبر من صفر'); return }
    if (reason.trim().length < 2) { setErr('اكتب سبب'); return }

    const delta = mode === 'add' ? num : -num

    start(async () => {
      const r = await adjustPoints(user.id, delta, reason.trim())
      if (!r.ok) { setErr(r.error ?? 'فشل'); return }
      setSuccess(`تم! الرصيد الجديد: ${r.balance}`)
      onUpdated(r.balance!)
      setTimeout(() => {
        onClose()
      }, 1200)
    })
  }

  return (
    <div className="adp__overlay" onClick={onClose}>
      <div className="adp__modal" onClick={e => e.stopPropagation()}>
        <header className="adp__modal-head">
          <h3>{user.display_name ?? 'مستخدم'}</h3>
          <button type="button" onClick={onClose} className="adp__modal-close">×</button>
        </header>

        <div className="adp__modal-user">
          <div><span>الرقم:</span> <strong dir="ltr">{user.phone ?? '—'}</strong></div>
          <div><span>الرصيد:</span> <strong>{user.trust_score}</strong></div>
          <div><span>الدور:</span> <strong>{user.role}</strong></div>
        </div>

        <form onSubmit={handleSubmit} className="adp__modal-form">
          <div className="adp__mode">
            <button type="button" className={mode === 'add' ? 'is-active' : ''} onClick={() => setMode('add')}>
              إضافة
            </button>
            <button type="button" className={mode === 'subtract' ? 'is-active' : ''} onClick={() => setMode('subtract')}>
              سحب
            </button>
          </div>

          <label>
            <span>المقدار</span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="مثلاً 50"
              required
            />
          </label>

          <label>
            <span>السبب</span>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="مثلاً: تعويض عن مشكلة / مكافأة يدوية"
              required
            />
          </label>

          {err && <div className="adp__modal-err">{err}</div>}
          {success && <div className="adp__modal-ok">{success}</div>}

          <div className="adp__modal-actions">
            <button type="button" onClick={onClose} className="adp__btn adp__btn--ghost">إلغاء</button>
            <button type="submit" className="adp__btn adp__btn--primary" disabled={pending}>
              {pending ? '...' : mode === 'add' ? `إضافة ${amount || 0}` : `سحب ${amount || 0}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
