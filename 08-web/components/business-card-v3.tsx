'use client'
import './business-card-v3.css'

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

const TYPE_GRADIENT: Record<CardVariant, { from: string; to: string; accent: string }> = {
  restaurant: { from: 'rgba(220, 90, 40, 0.55)', to: 'rgba(139, 92, 246, 0.15)', accent: '#DC5A28' },
  offer: { from: 'rgba(232, 199, 154, 0.5)', to: 'rgba(168, 85, 247, 0.2)', accent: '#E8C79A' },
  pharmacy: { from: 'rgba(74, 222, 128, 0.4)', to: 'rgba(20, 100, 80, 0.2)', accent: '#4ADE80' },
  delivery: { from: 'rgba(251, 146, 60, 0.5)', to: 'rgba(168, 85, 247, 0.15)', accent: '#FB923C' },
  market: { from: 'rgba(139, 92, 246, 0.4)', to: 'rgba(107, 33, 255, 0.15)', accent: '#A855F7' },
  new: { from: 'rgba(168, 85, 247, 0.45)', to: 'rgba(232, 199, 154, 0.15)', accent: '#C084FC' },
}

export default function BusinessCardV3({
  business,
  variant = 'restaurant',
  rating,
  deliveryTime = '20-30 د',
}: {
  business: Business
  variant?: CardVariant
  rating?: number
  deliveryTime?: string
}) {
  const { slug, name, type, area, badge, vibe, reason, open } = business
  const grad = TYPE_GRADIENT[variant]

  return (
    <a
      href={`/businesses/${slug}`}
      className={`v3card v3card--${variant}`}
      aria-label={name}
      style={
        {
          '--grad-from': grad.from,
          '--grad-to': grad.to,
          '--accent': grad.accent,
        } as React.CSSProperties
      }
    >
      {/* ===== Cover ===== */}
      <div className="v3card__cover">
        <div className="v3card__pattern" aria-hidden />
        <div className="v3card__emoji-wrap">
          <span className="v3card__emoji">{TYPE_EMOJI[type]}</span>
        </div>

        {/* شريط علوي: نوع + حالة */}
        <div className="v3card__top">
          <span className="v3card__type">{TYPE_LABEL[type]}</span>
          <span className={`v3card__live ${open ? 'is-on' : 'is-off'}`}>
            <span className="v3card__live-dot" />
            {open ? 'مفتوح' : 'مغلق'}
          </span>
        </div>

        {/* لافتة مميز */}
        {badge && <span className="v3card__badge">{badge}</span>}

        {/* معلومات أسفل الكوفر مباشرة */}
        <div className="v3card__info">
          <h3 className="v3card__name">{name}</h3>
          <div className="v3card__meta-row">
            <span className="v3card__meta-item">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {area}
            </span>
            <span className="v3card__meta-sep">•</span>
            <span className="v3card__meta-item">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {deliveryTime}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Footer ===== */}
      <div className="v3card__footer">
        <div className="v3card__rating">
          <span className="v3card__star">★</span>
          <strong>{rating.toFixed(1)}</strong>
        </div>

        <div className="v3card__vibes">
          {vibe.slice(0, 2).map((v) => (
            <span key={v} className="v3card__vibe">{v}</span>
          ))}
        </div>

        <div className="v3card__arrow" aria-hidden>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </div>
      </div>

      {/* ===== Hover reveal ===== */}
      <div className="v3card__reveal">
        <p>{reason}</p>
      </div>
    </a>
  )
}
