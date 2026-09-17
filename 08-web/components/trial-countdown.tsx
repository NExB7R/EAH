'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './trial-countdown.css'

type Status = {
  has_subscription: boolean
  status?: string
  is_trial?: boolean
  expires_at?: string
  seconds_left?: number
  days_left?: number
  hours_left?: number
  minutes_left?: number
  seconds_rem?: number
  is_expiring_soon?: boolean
}

export default function TrialCountdown({ businessId }: { businessId: string }) {
  const [status, setStatus] = useState<Status | null>(null)

  useEffect(() => {
    let alive = true
    void (async () => {
      const supabase = createClient()
      const { data } = await supabase.rpc('get_trial_status', { p_business_id: businessId })
      if (alive && data) setStatus(data as Status)
    })()
    return () => { alive = false }
  }, [businessId])

  // tick local seconds
  useEffect(() => {
    if (!status?.has_subscription || !status.seconds_left) return
    const t = setInterval(() => {
      setStatus((s) => {
        if (!s || !s.seconds_left) return s
        const left = Math.max(0, s.seconds_left - 1)
        return {
          ...s,
          seconds_left: left,
          days_left: Math.floor(left / 86400),
          hours_left: Math.floor((left % 86400) / 3600),
          minutes_left: Math.floor((left % 3600) / 60),
          seconds_rem: left % 60,
          is_expiring_soon: left < 7 * 86400,
        }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [status?.has_subscription, status?.seconds_left])

  if (!status?.has_subscription) return null

  const isTrial = status.is_trial
  const soon = status.is_expiring_soon
  const d = status.days_left ?? 0
  const h = status.hours_left ?? 0
  const m = status.minutes_left ?? 0
  const s = status.seconds_rem ?? 0

  return (
    <section className={`trial ${soon ? 'is-urgent' : ''} ${isTrial ? 'is-trial' : 'is-active'}`}>
      <div className="trial__inner">
        <span className="trial__emoji" aria-hidden></span>
        <div className="trial__info">
          <strong className="trial__title">
            {isTrial ? 'تجربتك المجانية شغالة' : 'باقتك شغالة'}
          </strong>
          <div className="trial__clock" dir="ltr">
            <span className="trial__unit"><b>{d}</b><small>يوم</small></span>
            <span className="trial__sep">:</span>
            <span className="trial__unit"><b>{String(h).padStart(2,'0')}</b><small>ساعة</small></span>
            <span className="trial__sep">:</span>
            <span className="trial__unit"><b>{String(m).padStart(2,'0')}</b><small>دقيقة</small></span>
            <span className="trial__sep">:</span>
            <span className="trial__unit"><b>{String(s).padStart(2,'0')}</b><small>ثانية</small></span>
          </div>
          {soon && <p className="trial__urgent">باقي أيام قليلة — جدّد من الباقات</p>}
        </div>
        <a href="/merchant/subscription" className="trial__cta">
          {isTrial ? 'اختار باقتك' : 'جدّد'} ←
        </a>
      </div>
    </section>
  )
}
