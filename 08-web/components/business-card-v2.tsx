'use client'
import './business-card-v2.css'

type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'
type CardVariant = 'restaurant' | 'offer' | 'pharmacy' | 'delivery' | 'market' | 'new'

type Business = {
  slug: string
  name: string
  type: BusinessType
  area: string
  badge?: string
  vibe: string[]
  reason: string
  open: boolean
}

const TYPE_EMOJI: Record<BusinessType, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  supermarket: '🛒',
  delivery_office: '🛵',
}

const TYPE_LABEL: Record<BusinessType, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'سوبر ماركت',
  delivery_office: 'توصيل',
}

export default function BusinessCardV2({
  business,
  variant = 'restaurant',
}: {
  business: Business
  variant?: CardVariant
}) {
  const { slug, name, type, area, badge, vibe, reason, open } = business

  return (
    <a
      href={`/businesses/${slug}`}
      className={`xcard xcard--${variant}`}
      aria-label={name}
    >
      <div className="xcard__cover">
        <div className="xcard__emoji-wrap">
          <span className="xcard__emoji">{TYPE_EMOJI[type]}</span>
        </div>

        <div className="xcard__top">
          <span className="xcard__type">{TYPE_LABEL[type]}</span>
          <span className={`xcard__live ${open ? 'is-on' : 'is-off'}`}>
            <span className="xcard__live-dot" />
            {open ? 'مفتوح' : 'مغلق'}
          </span>
        </div>

        {badge && <span className="xcard__badge">{badge}</span>}

        <div className="xcard__fade" />
      </div>

      <div className="xcard__body">
        <h3 className="xcard__name">{name}</h3>
        <div className="xcard__meta">
          <span className="xcard__area">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {area}
          </span>
          <span className="xcard__star">★</span>
          <span className="xcard__rating">4.7</span>
        </div>

        <div className="xcard__reveal">
          <p className="xcard__reason">{reason}</p>
          <div className="xcard__vibes">
            {vibe.slice(0, 3).map((v) => (
              <span key={v} className="xcard__vibe">{v}</span>
            ))}
          </div>
        </div>
      </div>
    </a>
  )
}
