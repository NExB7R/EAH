'use client'
import './explore-card.css'

type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'
type CardSize = 'hero' | 'lg' | 'md' | 'sm'

type Business = {
  slug: string
  name: string
  type: BusinessType
  area: string
  badge?: string
  vibe: string[]
  reason: string
  open: boolean
  score?: number
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

const TYPE_HUE: Record<BusinessType, { hue: string; soft: string; glow: string }> = {
  restaurant: { hue: '#FF7A3D', soft: 'rgba(255, 122, 61, 0.18)', glow: 'rgba(255, 122, 61, 0.4)' },
  pharmacy: { hue: '#4ADE80', soft: 'rgba(74, 222, 128, 0.18)', glow: 'rgba(74, 222, 128, 0.4)' },
  supermarket: { hue: '#A855F7', soft: 'rgba(168, 85, 247, 0.18)', glow: 'rgba(168, 85, 247, 0.4)' },
  delivery_office: { hue: '#E8C79A', soft: 'rgba(232, 199, 154, 0.18)', glow: 'rgba(232, 199, 154, 0.4)' },
}

export default function ExploreCard({
  business,
  size = 'md',
}: {
  business: Business
  size?: CardSize
}) {
  const theme = TYPE_HUE[business.type]

  return (
    <a
      href={`/businesses/${business.slug}`}
      className={`ecard ecard--${size}`}
      aria-label={business.name}
      style={{
        '--hue': theme.hue,
        '--soft': theme.soft,
        '--glow': theme.glow,
      } as React.CSSProperties}
    >
      <div className="ecard__bg" aria-hidden />

      {/* شريط علوي */}
      <div className="ecard__top">
        <span className="ecard__type">
          <span className="ecard__type-emoji">{TYPE_EMOJI[business.type]}</span>
          {TYPE_LABEL[business.type]}
        </span>
        <span className={`ecard__live ${business.open ? 'is-on' : 'is-off'}`}>
          <span className="ecard__live-dot" />
        </span>
      </div>

      {/* الأيقونة الكبيرة */}
      <div className="ecard__visual">
        <span className="ecard__emoji">{TYPE_EMOJI[business.type]}</span>
      </div>

      {/* المحتوى */}
      <div className="ecard__body">
        <h3 className="ecard__name">{business.name}</h3>

        <div className="ecard__meta">
          <span className="ecard__area">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {business.area}
          </span>

          {business.score !== undefined && (
            <span className="ecard__score">
              ★ {(business.score * 5).toFixed(1)}
            </span>
          )}
        </div>

        {/* Vibes — تظهر فقط في الأحجام الكبيرة */}
        {business.vibe.length > 0 && size !== 'sm' && (
          <div className="ecard__vibes">
            {business.vibe.slice(0, 2).map((v) => (
              <span key={v} className="ecard__vibe">#{v}</span>
            ))}
          </div>
        )}
      </div>

      {business.badge && <span className="ecard__badge">{business.badge}</span>}
    </a>
  )
}
