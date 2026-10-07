'use client'

import { StarIcon } from './icons'
import ReportButton from '@/app/reports/report-button'
import Avatar from './avatar'
import { DIMENSION_LABELS, type DimensionKey } from '@/lib/review-dimensions'
import type { Review } from '@/lib/data/business-detail'
import styles from './review-card.module.css'

type Props = {
  review: Review
  isOwner: boolean
  canReply: boolean
  onReply: (reviewId: string) => void
}

function Stars({ value }: { value: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon
          key={i}
          size={13}
          className={i <= Math.round(value) ? styles.starFilled : styles.starEmpty}
        />
      ))}
    </span>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'النهاردة'
  if (diffDays === 1) return 'امبارح'
  if (diffDays < 7) return `قبل ${diffDays} أيام`
  if (diffDays < 30) return `قبل ${Math.floor(diffDays / 7)} أسابيع`
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' })
}

export default function ReviewCard({ review, isOwner, canReply, onReply }: Props) {
  const name = review.reviewer?.display_name ?? 'مستخدم'
  const dims = review.dimensions ?? {}
  const entries = Object.entries(dims).filter(([, v]) => typeof v === 'number' && v > 0)

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <Avatar
          displayName={name}
          avatarUrl={review.reviewer?.avatar_url ?? null}
          role="customer"
          size="sm"
        />
        <div className={styles.headerText}>
          <span className={styles.name}>{name}</span>
          <span className={styles.date}>{formatDate(review.created_at)}</span>
        </div>
        {!isOwner && (
          <div className={styles.reportWrap}>
            <ReportButton entityType="review" entityId={review.id} variant="icon" />
          </div>
        )}
      </header>

      {review.comment && <p className={styles.comment}>{review.comment}</p>}

      {entries.length > 0 && (
        <div className={styles.ratings}>
          {entries.map(([key, value]) => {
            const label = DIMENSION_LABELS[key as DimensionKey] ?? key
            return (
              <div key={key} className={styles.ratingRow}>
                <span>{label}</span>
                <Stars value={value} />
              </div>
            )
          })}
        </div>
      )}

      {review.merchant_reply ? (
        <div className={styles.reply}>
          <span className={styles.replyLabel}>رد النشاط</span>
          <p className={styles.replyText}>{review.merchant_reply}</p>
        </div>
      ) : isOwner && canReply ? (
        <button type="button" className={styles.replyBtn} onClick={() => onReply(review.id)}>
          رد على التقييم
        </button>
      ) : null}
    </article>
  )
}
