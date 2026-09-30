'use client'

import { useState } from 'react'
import { StarIcon, CloseIcon } from './icons'
import { submitReview } from '@/app/reviews/actions'
import styles from './review-form.module.css'

type Props = {
  businessId: string
  slug: string
  onClose: () => void
}

const CATEGORIES = [
  { key: 'experience', label: 'التجربة العامة' },
  { key: 'taste', label: 'الطعم' },
  { key: 'value_for_money', label: 'القيمة' },
  { key: 'speed', label: 'السرعة' },
] as const

type CatKey = (typeof CATEGORIES)[number]['key']

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className={styles.picker} role="radiogroup">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} نجوم`}
          className={styles.pickerStar}
          onClick={() => onChange(i)}
        >
          <StarIcon size={22} className={i <= value ? styles.pickerFilled : styles.pickerEmpty} />
        </button>
      ))}
    </div>
  )
}

export default function ReviewForm({ businessId, slug, onClose }: Props) {
  const [ratings, setRatings] = useState<Record<CatKey, number>>({
    experience: 0,
    taste: 0,
    value_for_money: 0,
    speed: 0,
  })
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const setRating = (key: CatKey, v: number) =>
    setRatings((r) => ({ ...r, [key]: v === r[key] ? 0 : v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const fd = new FormData()
    for (const k of Object.keys(ratings) as CatKey[]) {
      if (ratings[k] > 0) fd.set(k, String(ratings[k]))
    }
    fd.set('comment', comment)

    const res = await submitReview(businessId, slug, fd)
    setLoading(false)

    if (!res.ok) {
      setError(res.error)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className={styles.wrap}>
        <div className={styles.success}>
          <StarIcon size={44} className={styles.successIcon} />
          <h3>شكراً لتقييمك!</h3>
          <p>تقييمك هيظهر بعد المراجعة</p>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            تمام
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h3 className={styles.title}>قيّم تجربتك</h3>
        <button type="button" onClick={onClose} className={styles.xBtn} aria-label="إغلاق">
          <CloseIcon size={18} />
        </button>
      </div>

      <div className={styles.categories}>
        {CATEGORIES.map((c) => (
          <div key={c.key} className={styles.category}>
            <span className={styles.catLabel}>{c.label}</span>
            <StarPicker value={ratings[c.key]} onChange={(v) => setRating(c.key, v)} />
          </div>
        ))}
      </div>

      <div className={styles.field}>
        <label htmlFor="comment" className={styles.fieldLabel}>
          تعليقك
        </label>
        <textarea
          id="comment"
          className={styles.textarea}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="قولنا تجربتك بالتفصيل..."
          rows={4}
          maxLength={500}
          required
          minLength={10}
        />
        <span className={styles.hint}>{comment.length} / 500</span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? 'جاري الإرسال...' : 'أرسل التقييم'}
      </button>
    </form>
  )
}
