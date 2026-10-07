'use client'

import { useMemo, useState } from 'react'
import { StarIcon, CloseIcon } from './icons'
import { submitReview } from '@/app/reviews/actions'
import { getReviewDimensions, type Dimension } from '@/lib/review-dimensions'
import type { BusinessType } from '@/lib/data/businesses'
import styles from './review-form.module.css'

type Props = {
  businessId: string
  businessType: BusinessType
  subcategory: string | null
  slug: string
  onClose: () => void
}

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

export default function ReviewForm({
  businessId,
  businessType,
  subcategory,
  slug,
  onClose,
}: Props) {
  const dimensions = useMemo(
    () => getReviewDimensions(businessType, subcategory),
    [businessType, subcategory],
  )

  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const setRating = (key: string, v: number) =>
    setRatings((r) => ({ ...r, [key]: v === r[key] ? 0 : v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const cleaned: Record<string, number> = {}
    for (const d of dimensions) {
      const v = ratings[d.key]
      if (v && v > 0) cleaned[d.key] = v
    }

    if (Object.keys(cleaned).length === 0) {
      setError('قيّم بُعد واحد على الأقل')
      return
    }

    setLoading(true)

    const fd = new FormData()
    fd.set('dimensions', JSON.stringify(cleaned))
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
        {dimensions.map((d: Dimension) => (
          <div key={d.key} className={styles.category}>
            <span className={styles.catLabel}>{d.label}</span>
            <StarPicker value={ratings[d.key] ?? 0} onChange={(v) => setRating(d.key, v)} />
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
