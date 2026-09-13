'use client'
import { useEffect, useState } from 'react'
import { getStreakEmoji, getStreakLabel, type StreakData } from '@/lib/streak'

export default function StreakBadge({ inline = false }: { inline?: boolean }) {
  const [data, setData] = useState<StreakData | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    fetch('/api/record-visit', { method: 'POST' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.ok) return
        setData(d)
        if (!d.already_visited && d.points_earned > 0 && d.streak > 1) {
          setShowCelebration(true)
          setTimeout(() => setShowCelebration(false), 4500)
        }
      })
      .catch(() => {})
  }, [])

  if (!data) return null
  // إخفاء الشارة في اليوم الأول (مزعجة)
  if ((data.streak ?? 0) <= 1) return null

  return (
    <>
      <div className={`streak-badge ${inline ? 'streak-badge--inline' : ''}`}>
        <span className="streak-badge__emoji">{getStreakEmoji(data.streak)}</span>
        <div className="streak-badge__text">
          <span className="streak-badge__count">{data.streak} يوم</span>
          <span className="streak-badge__label">{getStreakLabel(data.streak)}</span>
        </div>
      </div>

      {showCelebration && (
        <div className="streak-celebration">
          <div className="streak-celebration__card">
            <span className="streak-celebration__emoji">🎉</span>
            <h3 className="streak-celebration__title">
              {`يوم ${data.streak} على التوالي!`}
            </h3>
            <p className="streak-celebration__msg">
              كسبت <strong>+{data.points_earned}</strong> نقطة
            </p>
            {data.longest > data.streak && (
              <p className="streak-celebration__sub">أطول streak: {data.longest} يوم</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
