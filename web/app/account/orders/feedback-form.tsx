'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StarIcon, AlertIcon, CheckCircleIcon, CloseIcon } from '@/components/icons'
import { submitOrderFeedback } from './actions'
import { FEEDBACK_ISSUE_LABEL, type FeedbackIssueType } from '@/lib/data/orders'
import styles from './feedback-form.module.css'

type Props = {
  orderId: string
  businessName: string
}

export default function FeedbackForm({ orderId, businessName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [issue, setIssue] = useState<FeedbackIssueType | null>(null)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submit = () => {
    if (rating < 1) {
      setError('اختار تقييم من 1 لـ 5')
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await submitOrderFeedback({
        orderId,
        rating,
        issue_type: issue,
        text,
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          setOpen(false)
          router.refresh()
        }, 900)
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={styles.trigger}>
        <StarIcon size={14} />
        <span>قيّم الطلب</span>
      </button>

      {open && (
        <div className={styles.backdrop} onClick={() => !pending && setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => !pending && setOpen(false)}
              className={styles.close}
              aria-label="إغلاق"
            >
              <CloseIcon size={16} />
            </button>

            {success ? (
              <div className={styles.successBox}>
                <span className={styles.successIcon}>
                  <CheckCircleIcon size={36} />
                </span>
                <h3 className={styles.successTitle}>شكراً!</h3>
                <p className={styles.successText}>تقييمك يساعد {businessName} والناس</p>
              </div>
            ) : (
              <>
                <h3 className={styles.title}>قيّم طلبك من {businessName}</h3>
                <p className={styles.subtitle}>رأيك يساعدنا نحسّن الخدمة</p>

                {/* Stars */}
                <div className={styles.stars} role="radiogroup" aria-label="تقييم">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const filled = (hover || rating) >= n
                    return (
                      <button
                        key={n}
                        type="button"
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(n)}
                        disabled={pending}
                        className={`${styles.star} ${filled ? styles.starFilled : ''}`}
                        aria-label={`${n} من 5`}
                        aria-checked={rating === n}
                        role="radio"
                      >
                        <StarIcon size={32} />
                      </button>
                    )
                  })}
                </div>
                {rating > 0 && (
                  <p className={styles.ratingLabel}>
                    {rating === 5
                      ? 'ممتاز'
                      : rating === 4
                        ? 'جيد جداً'
                        : rating === 3
                          ? 'جيد'
                          : rating === 2
                            ? 'مقبول'
                            : 'ضعيف'}
                  </p>
                )}

                {/* Issue type (only if low rating) */}
                {rating > 0 && rating <= 3 && (
                  <div className={styles.issueWrap}>
                    <span className={styles.label}>إيه المشكلة الأساسية؟ (اختياري)</span>
                    <div className={styles.issueOptions}>
                      {(Object.keys(FEEDBACK_ISSUE_LABEL) as FeedbackIssueType[]).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setIssue(issue === k ? null : k)}
                          disabled={pending}
                          className={`${styles.issueBtn} ${issue === k ? styles.issueBtnActive : ''}`}
                        >
                          {FEEDBACK_ISSUE_LABEL[k]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comment */}
                <div className={styles.commentWrap}>
                  <label className={styles.label} htmlFor="feedback-text">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <textarea
                    id="feedback-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className={styles.textarea}
                    placeholder="قولنا إيه اللي حصل..."
                    dir="rtl"
                    disabled={pending}
                  />
                </div>

                {error && (
                  <div className={styles.error}>
                    <AlertIcon size={12} />
                    <span>{error}</span>
                  </div>
                )}

                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={pending || rating < 1}
                    className={styles.submitBtn}
                  >
                    {pending ? 'بيتم…' : 'إرسال التقييم'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={pending}
                    className={styles.cancelBtn}
                  >
                    إلغاء
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
