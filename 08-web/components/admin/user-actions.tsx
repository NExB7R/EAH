'use client'
import { useState, useTransition } from 'react'
import { banUser, unbanUser, setUserRole } from '@/app/admin/users/actions'
import { IcBan } from '@/components/eah-icons'

type Props = {
  userId: string
  isBanned: boolean
  currentRole: string
  bannedUntil: string | null
}

export default function UserActions({ userId, isBanned, currentRole, bannedUntil }: Props) {
  const [pending, startTransition] = useTransition()
  const [showBan, setShowBan] = useState(false)
  const [days, setDays] = useState(7)
  const [reason, setReason] = useState('')
  const [showRole, setShowRole] = useState(false)
  const [role, setRole] = useState(currentRole)

  const handleBan = () => {
    startTransition(async () => {
      const res = await banUser(userId, days, reason)
      if (!res.ok) alert(res.message ?? 'فشل')
      setShowBan(false)
    })
  }

  const handleUnban = () => {
    startTransition(async () => {
      const res = await unbanUser(userId)
      if (!res.ok) alert(res.message ?? 'فشل')
    })
  }

  const handleRoleChange = (newRole: string) => {
    if (newRole === currentRole) return
    if (!confirm(`تغيير الدور إلى ${newRole}؟`)) return
    startTransition(async () => {
      const res = await setUserRole(userId, newRole as any)
      if (!res.ok) alert(res.message ?? 'فشل')
      setShowRole(false)
    })
  }

  const daysLeft = bannedUntil
    ? Math.max(0, Math.ceil((new Date(bannedUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="uact">
      {isBanned ? (
        <button
          type="button"
          className="admin-btn admin-btn--sm"
          onClick={handleUnban}
          disabled={pending}
          title={`متبقي ${daysLeft} يوم`}
        >
          ✅ فك الحظر ({daysLeft}ي)
        </button>
      ) : (
        <button
          type="button"
          className="admin-btn admin-btn--sm admin-btn--danger"
          onClick={() => setShowBan(true)}
          disabled={pending}
        >
          <IcBan /> حظر
        </button>
      )}

      <button
        type="button"
        className="admin-btn admin-btn--sm"
        onClick={() => setShowRole(!showRole)}
        disabled={pending}
      >
        🎭 {currentRole}
      </button>

      {showRole && (
        <div className="uact__dropdown">
          {['customer', 'merchant', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              className={`uact__opt ${r === currentRole ? 'is-active' : ''}`}
              onClick={() => handleRoleChange(r)}
              disabled={pending}
            >
              {r === currentRole ? '✓ ' : ''}{r}
            </button>
          ))}
        </div>
      )}

      {showBan && (
        <div className="admin-overlay" style={{ display: 'block', zIndex: 100 }} onClick={() => setShowBan(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--eah-black-2)',
              border: '1px solid var(--eah-red)',
              borderRadius: 'var(--eah-radius-lg)',
              padding: 24, maxWidth: 420, width: 'calc(100% - 32px)',
              zIndex: 101, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', color: 'var(--eah-text)' }}><IcBan /> حظر المستخدم</h3>

            <label className="admin-field__label" style={{ display: 'block', marginBottom: 6 }}>المدة</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {[1, 3, 7, 30, 9999].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`admin-btn admin-btn--sm ${days === d ? 'admin-btn--primary' : ''}`}
                  onClick={() => setDays(d)}
                >
                  {d === 9999 ? 'دائم' : `${d} يوم`}
                </button>
              ))}
            </div>

            <label className="admin-field__label" style={{ display: 'block', marginBottom: 6 }}>السبب (اختياري)</label>
            <textarea
              className="admin-textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثلاً: تلاعب في التقييمات"
              style={{ marginBottom: 14 }}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowBan(false)}>إلغاء</button>
              <button type="button" className="admin-btn admin-btn--danger" onClick={handleBan} disabled={pending}>
                {pending ? 'جاري...' : <><IcBan /> حظر</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
