'use client'
import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './review-form.css'

const RATINGS = [
  { key: 'taste',      emoji: '😋', label: 'الطعم' },
  { key: 'value',      emoji: '💰', label: 'القيمة' },
  { key: 'speed',      emoji: '⚡', label: 'السرعة' },
  { key: 'experience', emoji: '✨', label: 'التجربة' },
]

export default function ReviewForm({ businessId, onDone }: { businessId: string; onDone?: () => void }) {
  const [open, setOpen] = useState(false)
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')
  const [msg, setMsg] = useState('')
  const [pending, start] = useTransition()
  const [needsAuth, setNeedsAuth] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let alive = true
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (alive) setNeedsAuth(!user)
    })()
    return () => { alive = false }
  }, [])

  function setRating(key: string, val: number) {
    setRatings(r => ({ ...r, [key]: val }))
  }

  function submit() {
    const missing = RATINGS.filter(r => !ratings[r.key])
    if (missing.length > 0) { setMsg('قيّم كل الجوانب'); return }
    if (comment.trim().length < 5) { setMsg('اكتب تعليق (5 حروف على الأقل)'); return }

    start(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const next = window.location.pathname
        window.location.href = `/auth?next=${encodeURIComponent(next)}`
        return
      }

      const avg = Math.round(
        (ratings.taste + ratings.value + ratings.speed + ratings.experience) / 4
      )

      const { error } = await supabase.from('business_reviews').insert({
        business_id: businessId,
        user_id: user.id,
        rating: avg,
        taste_rating: ratings.taste,
        value_rating: ratings.value,
        speed_rating: ratings.speed,
        experience_rating: ratings.experience,
        comment: comment.trim(),
        status: 'pending',
      })

      if (error) { setMsg(error.message); return }

      // ابعت push للمالك
      fetch('/api/push/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'review',
          businessId: businessId,
          title: '⭐ تقييم جديد',
          body: `حد قيّم نشاطك (${avg} نجوم)`,
        }),
      }).catch(() => {})

      setMsg('✅ تم الإرسال، شكرًا! هيتنشر بعد المراجعة')
      setTimeout(() => {
        setOpen(false)
        setMsg('')
        setComment('')
        setRatings({})
        onDone?.()
      }, 2000)
    })
  }

  function handleTrigger() {
    if (needsAuth) {
      const next = typeof window !== 'undefined' ? window.location.pathname : '/'
      window.location.href = `/auth?next=${encodeURIComponent(next)}`
      return
    }
    setOpen(true)
  }

  if (!open) {
    return (
      <button
        type="button"
        className="rvf-trigger"
        onClick={handleTrigger}
        title={needsAuth ? 'سجّل عشان تكتب تقييم' : undefined}
      >
        ✍️ اكتب تقييم
      </button>
    )
  }

  return (
    <div className="rvf">
      <h3 className="rvf__title">✍️ قيّم تجربتك</h3>

      <div className="rvf__ratings">
        {RATINGS.map(r => (
          <div key={r.key} className="rvf__rating">
            <span className="rvf__rating-label">{r.emoji} {r.label}</span>
            <div className="rvf__stars">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`rvf__star ${(ratings[r.key] ?? 0) >= n ? 'is-on' : ''}`}
                  onClick={() => setRating(r.key, n)}
                  aria-label={`${n} نجوم`}
                >★</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="اكتب تجربتك..."
        className="rvf__textarea"
        maxLength={500}
        rows={4}
        disabled={pending}
      />

      {msg && <p className={`rvf__msg ${msg.startsWith('✅') ? 'is-ok' : ''}`}>{msg}</p>}

      <div className="rvf__actions">
        <button type="button" className="rvf__btn rvf__btn--ghost" onClick={() => setOpen(false)} disabled={pending}>إلغاء</button>
        <button type="button" className="rvf__btn rvf__btn--primary" onClick={submit} disabled={pending}>
          {pending ? '...' : 'انشر التقييم'}
        </button>
      </div>
    </div>
  )
}
