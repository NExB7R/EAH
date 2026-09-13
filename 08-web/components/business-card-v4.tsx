'use client'
import './business-card-v4.css'

type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'
type CardSize = 'hero' | 'lg' | 'md' | 'sm'

type Business = {
  slug: string
  name: string
  type: BusinessType
  area: string
  badge?: string
  is_premium?: boolean
  vibe: string[]
  reason: string
  open: boolean
}

const TYPE_EMOJI: Record<BusinessType, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  delivery_office: '🛵',
  supermarket: '🛒',
}

const TYPE_LABEL: Record<BusinessType, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  delivery_office: 'توصيل',
  supermarket: 'ماركت',
}

const TYPE_THEME: Record<BusinessType, { from: string; to: string; accent: string }> = {
  restaurant: { from: '#2a1610', to: '#1a0d08', accent: '#FF7A3D' },
  pharmacy:   { from: '#0d2419', to: '#08160f', accent: '#4ADE80' },
  delivery_office: { from: '#2a1a0d', to: '#1a1008', accent: '#FB923C' },
  supermarket: { from: '#F59E0B', to: '#DC2626', accent: '#FBBF24' },
}

const REASON_HOOKS: Record<string, string[]> = {
  'مميز': ['مختار بعناية', 'اللي الكل بيتكلم عنه', 'من الأفضل عندنا'],
  'جديد': ['جديد علينا', 'لسه فتح', 'تجربة جديدة'],
  'عروض نشطة': ['عنده عرض دلوقتي', 'وفّر معاهم', 'عرض محدود'],
  'ترند': ['رائج دلوقتي', 'الكل بيسأل عنه', 'الأكثر زيارة'],
  'الأعلى تقييماً': ['الأعلى تقييماً', 'الناس بتحبه', 'من الأحسن'],
  'مختار لك': ['على مزاجك', 'مناسب ليك', 'اختيار موفق'],
}

function getHook(reason: string, slug: string): string {
  const list = REASON_HOOKS[reason] ?? REASON_HOOKS['مختار لك']
  const hash = slug.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return list[hash % list.length]
}

export default function BusinessCardV4({
  business,
  size = 'md',
  hook,
}: {
  business: Business
  size?: CardSize
  hook?: string
}) {
  const { slug, name, type, area, vibe, reason, open } = business
  const theme = TYPE_THEME[type]
  const displayHook = hook ?? getHook(reason, slug)

  return (
    <a
      href={`/businesses/${slug}`}
      className={`v4card v4card--${size}`}
      aria-label={name}
      style={{
        '--theme-from': theme.from,
        '--theme-to': theme.to,
        '--theme-accent': theme.accent,
      } as React.CSSProperties}
    >
      <div className="v4card__bg" aria-hidden />

      <div className="v4card__top">
        <span className="v4card__type">
          {TYPE_EMOJI[type]} {TYPE_LABEL[type]}
        </span>
        <span className={`v4card__live ${open ? 'is-on' : 'is-off'}`}>
          <span className="v4card__dot" />
        </span>
      </div>

      <div className="v4card__visual">
        <span className="v4card__emoji">{TYPE_EMOJI[type]}</span>
      </div>

      <div className="v4card__body">
        <h3 className="v4card__name">{name}</h3>
        <span className="v4card__area">{area}</span>

        <div className="v4card__hook">
          <span className="v4card__hook-dot" />
          <span>{displayHook}</span>
        </div>
      </div>

      {badge_placeholder(business.badge, business.is_premium)}
    </a>
  )
}

function badge_placeholder(badge: string | undefined, isPremium?: boolean) {
  if (!badge && !isPremium) return null
  const label = isPremium ? 'مميز' : badge
  return (
    <span className={`v4card__badge ${isPremium || badge === 'مميز' ? 'v4card__badge--premium' : ''}`}>
      {(isPremium || badge === 'مميز') && (
        <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden>
          <path d="M12 2l2.39 7.36H22l-6.2 4.5 2.39 7.36L12 16.72 5.81 21.22 8.2 13.86 2 9.36h7.61L12 2z" />
        </svg>
      )}
      <span>{label}</span>
    </span>
  )
}
