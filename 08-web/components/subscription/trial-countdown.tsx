'use client'
import { useEffect, useState } from 'react'
import './trial-countdown.css'

export default function TrialCountdown({
  expiresAt,
  status,
}: {
  expiresAt: string
  status: 'trial' | 'active'
}) {
  const [daysLeft, setDaysLeft] = useState<number>(0)

  useEffect(() => {
    function tick() {
      const diff = new Date(expiresAt).getTime() - Date.now()
      setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))))
    }
    tick()
    const t = setInterval(tick, 60_000)
    return () => clearInterval(t)
  }, [expiresAt])

  const urgent = daysLeft <= 7
  const expired = daysLeft === 0
  const label = status === 'trial' ? 'التجربة المجانية' : 'الاشتراك'

  return (
    <div className={`tcd ${urgent ? 'is-urgent' : ''} ${expired ? 'is-expired' : ''}`}>
      <div className="tcd__head">
        <span className="tcd__label">{label}</span>
        <span className="tcd__status">
          {expired ? 'انتهى' : urgent ? 'بينتهي قريب' : 'نشط'}
        </span>
      </div>
      <div className="tcd__count">
        {expired ? (
          <span className="tcd__num">0</span>
        ) : (
          <span className="tcd__num">{daysLeft}</span>
        )}
        <span className="tcd__unit">يوم متبقي</span>
      </div>
      {urgent && !expired && (
        <p className="tcd__msg">
          ⚡ جدّد دلوقتي عشان متخسرش شارة "مميز" والإعلانات
        </p>
      )}
      {expired && (
        <p className="tcd__msg tcd__msg--danger">
          تم إيقاف المميزات. تواصل معنا للتجديد.
        </p>
      )}
    </div>
  )
}
