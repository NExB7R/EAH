'use client'
import MerchantReplyForm from './merchant-reply-form'
import './merchant-reply-form.css'
import './business-reviews.css'

type Stats = {
  avg_taste: number
  avg_value: number
  avg_speed: number
  avg_experience: number
  avg_rating: number
  review_count: number
}

type Review = {
  id: string
  taste: number
  value_for_money: number
  speed: number
  experience: number
  comment: string | null
  created_at: string
  user_name: string | null
  merchant_reply?: string | null
  merchant_reply_at?: string | null
  business_id?: string
}

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value)
  return (
    <span className="brev__stars" aria-label={`${value.toFixed(1)} من 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`brev__star ${i <= rounded ? 'is-on' : ''}`}>★</span>
      ))}
    </span>
  )
}

function RatingBar({ label, value, icon }: { label: string; value: number; icon: string }) {
  const pct = (value / 5) * 100
  return (
    <div className="brev__bar">
      <div className="brev__bar-head">
        <span className="brev__bar-icon">{icon}</span>
        <span className="brev__bar-label">{label}</span>
        <strong className="brev__bar-value">{value.toFixed(1)}</strong>
      </div>
      <div className="brev__bar-track">
        <div className="brev__bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function BusinessReviews({
  stats,
  reviews,
}: {
  stats: Stats
  reviews: Review[]
}) {
  if (stats.review_count === 0) {
    return (
      <section className="brev brev--empty">
        <h2 className="brev__title">
          <span>⭐</span> التقييمات
        </h2>
        <p className="brev__empty-msg">
          لسه مفيش تقييمات لهذا المكان. كُن أول من يشارك تجربته.
        </p>
      </section>
    )
  }

  return (
    <section className="brev">
      <div className="brev__header">
        <h2 className="brev__title">
          <span>⭐</span> التقييمات
        </h2>
        <span className="brev__count">{stats.review_count} تقييم</span>
      </div>

      <div className="brev__summary">
        <div className="brev__score">
          <div className="brev__score-num">{stats.avg_rating.toFixed(1)}</div>
          <Stars value={stats.avg_rating} />
          <div className="brev__score-label">متوسط عام</div>
        </div>

        <div className="brev__bars">
          <RatingBar label="الطعم" value={stats.avg_taste} icon="😋" />
          <RatingBar label="القيمة" value={stats.avg_value} icon="💰" />
          <RatingBar label="السرعة" value={stats.avg_speed} icon="⚡" />
          <RatingBar label="التجربة" value={stats.avg_experience} icon="✨" />
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="brev__list">
          <h3 className="brev__list-title">آخر التعليقات</h3>
          {reviews.map((r) => {
            const avg = (r.taste + r.value_for_money + r.speed + r.experience) / 4
            return (
              <div key={r.id} className="brev__item">
                <div className="brev__item-head">
                  <div className="brev__avatar">
                    {(r.user_name ?? 'ز').charAt(0)}
                  </div>
                  <div className="brev__item-info">
                    <div className="brev__item-name">{r.user_name ?? 'زائر'}</div>
                    <div className="brev__item-meta">
                      <Stars value={avg} />
                      <span className="brev__item-date">
                        {new Date(r.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>
                {r.comment && (
                  <p className="brev__item-comment">{r.comment}</p>
                )}
                {r.merchant_reply ? (
                  <div className="brev__merchant-reply">
                    <span className="brev__merchant-reply-label">💬 ردّ التاجر:</span>
                    <p className="brev__merchant-reply-text">{r.merchant_reply}</p>
                  </div>
                ) : null}
                {r.id && <MerchantReplyForm reviewId={r.id} existingReply={r.merchant_reply} />}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
