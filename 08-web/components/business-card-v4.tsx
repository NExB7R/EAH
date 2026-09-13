'use client'
import './business-card-v4.css'

type BusinessType = 'restaurant' | 'pharmacy' | 'delivery_office'
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
}

const TYPE_EMOJI: Record<BusinessType, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  delivery_office: '🛵',
}

const TYPE_LABEL: Record<BusinessType, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  delivery_office: 'توصيل',
}

const TYPE_THEME: Record<BusinessType, { from: string; to: string; accent: string }> = {
  restaurant: { from: '#2a1610', to: '#1a0d08', accent: '#FF7A3D' },
  pharmacy:   { from: '#0d2419', to: '#08160f', accent: '#4ADE80' },
  delivery_office: { from: '#2a1a0d', to: '#1a1008', accent: '#FB923C' },
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

      {badge_placeholder(business.badge)}
    </a>
  )
}

function badge_placeholder(badge: string | undefined) {
  if (!badge) return null
  return <span className="v4card__badge">{badge}</span>
}
