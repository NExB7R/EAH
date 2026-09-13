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

const VARIANT_ACCENT: Record<CardVariant, string> = {
  restaurant: '#FF7A3D',
  offer:      '#E8C79A',
  pharmacy:   '#4ADE80',
  delivery:   '#FB923C',
  market:     '#A855F7',
  new:        '#C084FC',
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

export default function BusinessCardV3({
  business,
  variant = 'restaurant',
  hook,
}: {
  business: Business
  variant?: CardVariant
  hook?: string
}) {
  const { slug, name, type, area, vibe, reason, open } = business
  const accent = VARIANT_ACCENT[variant]
  const displayHook = hook ?? getHook(reason, slug)
  const initial = name.charAt(0)

  return (
    <a
      href={`/businesses/${slug}`}
      className={`ecard ecard--${variant}`}
      aria-label={name}
      style={{ '--accent': accent } as React.CSSProperties}
    >
      {/* الشريط الملون على الجنب */}
      <span className="ecard__accent" aria-hidden />

      {/* ===== المحتوى ===== */}
      <div className="ecard__body">
        {/* صف 1: نوع + حالة */}
        <div className="ecard__top">
          <span className="ecard__type">{TYPE_LABEL[type]}</span>
          <span className={`ecard__status ${open ? 'is-on' : 'is-off'}`}>
            <span className="ecard__dot" />
            {open ? 'مفتوح' : 'مغلق'}
          </span>
        </div>

        {/* صف 2: الأفاتار + الاسم */}
        <div className="ecard__main">
          <div className="ecard__avatar">
            <span className="ecard__avatar-emoji">{TYPE_EMOJI[type]}</span>
          </div>
          <div className="ecard__title-wrap">
            <h3 className="ecard__name">{name}</h3>
            <span className="ecard__area">{area}</span>
          </div>
        </div>

        {/* صف 3: الهوك */}
        <div className="ecard__hook">
          <span className="ecard__hook-dot" aria-hidden />
          <span className="ecard__hook-text">{displayHook}</span>
        </div>

        {/* صف 4: الفايبس */}
        {vibe.length > 0 && (
          <div className="ecard__vibes">
            {vibe.slice(0, 2).map((v) => (
              <span key={v} className="ecard__vibe">#{v}</span>
            ))}
          </div>
        )}
      </div>

      {/* السهم */}
      <span className="ecard__arrow" aria-hidden>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </span>
    </a>
  )
}
