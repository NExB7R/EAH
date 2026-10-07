'use client'

import { useState } from 'react'
import { MessageCircleIcon, StarIcon } from './icons'
import ReviewCard from './review-card'
import ReviewForm from './review-form'
import { replyToReview } from '@/app/reviews/actions'
import type { Review, ReviewStats } from '@/lib/data/business-detail'
import { DIMENSION_LABELS, type DimensionKey } from '@/lib/review-dimensions'
import type { BusinessType } from '@/lib/data/businesses'
import styles from './reviews-list.module.css'

type Props = {
  businessId: string
  businessType: BusinessType
  subcategory: string | null
  slug: string
  reviews: Review[]
  stats: ReviewStats
  isLoggedIn: boolean
  hasReviewed: boolean
  isOwner: boolean
}

export default function ReviewsList({
  businessId,
  businessType,
  subcategory,
  slug,
  reviews,
  stats,
  isLoggedIn,
  hasReviewed,
  isOwner,
}: Props) {
  const [showForm, setShowForm] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  async function submitReply(reviewId: string) {
    setReplyLoading(true)
    setReplyError(null)
    const fd = new FormData()
    fd.set('reply', replyText)
    const res = await replyToReview(reviewId, slug, fd)
    setReplyLoading(false)
    if (!res.ok) {
      setReplyError(res.error)
      return
    }
    setReplyTo(null)
    setReplyText('')
  }

  const canShowForm = isLoggedIn && !hasReviewed && !isOwner

  return (
    <div className={styles.wrap}>
      {/* Stats */}
      {stats.count > 0 && (
        <div className={styles.stats}>
          <div className={styles.avgBox}>
            <span className={styles.avgNum}>{stats.avg.toFixed(1)}</span>
            <div className={styles.avgStars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon
                  key={i}
                  size={15}
                  className={i <= Math.round(stats.avg) ? styles.starFilled : styles.starEmpty}
                />
              ))}
            </div>
            <span className={styles.avgCount}>{stats.count} تقييم</span>
          </div>

          <div className={styles.bars}>
            {Object.entries(stats.breakdown).map(([key, value]) => {
              const label = DIMENSION_LABELS[key as DimensionKey] ?? key
              return (
                <div key={key} className={styles.barRow}>
                  <span>{label}</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${(value / 5) * 100}%` }} />
                  </div>
                  <span className={styles.barNum}>{value.toFixed(1)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      {canShowForm && !showForm && (
        <button type="button" className={styles.ctaBtn} onClick={() => setShowForm(true)}>
          <StarIcon size={16} />
          اكتب تقييمك
        </button>
      )}

      {hasReviewed && (
        <div className={styles.infoBox}>
          <MessageCircleIcon size={16} />
          <span>قيّمت النشاط ده — شكراً لك</span>
        </div>
      )}

      {!isLoggedIn && (
        <div className={styles.infoBox}>
          <span>سجّل دخول عشان تكتب تقييم</span>
        </div>
      )}

      {showForm && (
        <ReviewForm
          businessId={businessId}
          businessType={businessType}
          subcategory={subcategory}
          slug={slug}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* List */}
      {reviews.length === 0 ? (
        <div className={styles.empty}>
          <MessageCircleIcon size={40} />
          <p>لسه مفيش تقييمات — كن أول واحد</p>
        </div>
      ) : (
        <div className={styles.list}>
          {reviews.map((r) => (
            <div key={r.id}>
              <ReviewCard
                review={r}
                isOwner={isOwner}
                canReply={!r.merchant_reply}
                onReply={(id) => {
                  setReplyTo(id)
                  setReplyText('')
                }}
              />

              {replyTo === r.id && (
                <div className={styles.replyForm}>
                  <textarea
                    className={styles.replyTextarea}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="اكتب ردك..."
                    rows={3}
                    maxLength={500}
                  />
                  {replyError && <div className={styles.replyError}>{replyError}</div>}
                  <div className={styles.replyActions}>
                    <button
                      type="button"
                      className={styles.replyCancel}
                      onClick={() => setReplyTo(null)}
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      className={styles.replySubmit}
                      onClick={() => submitReply(r.id)}
                      disabled={replyLoading || replyText.trim().length < 5}
                    >
                      {replyLoading ? '...' : 'رد'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
