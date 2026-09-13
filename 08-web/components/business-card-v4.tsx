'use client'
import './business-card-v4.css'

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
  restaurant: '🍽️', pharmacy: '💊', supermarket: '🛒', delivery_office: '🛵',
}

const VARIANT_ACCENT: Record<CardVariant, string> = {
  restaurant: '#FF7A3D', offer: '#E8C79A', pharmacy: '#4ADE80',
  delivery: '#FB923C', market: '#A855F7', new: '#C084FC',
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

  return (
    <a
      href={`/businesses/${slug}`}
      className={`fcard fcard--${variant}`}
      aria-label={name}
      style={{ '--accent': accent } as React.CSSProperties}
    >
      {/* ===== الصورة/الخلفية الكبيرة ===== */}
      <div className="fcard__image">
        <span className="fcard__emoji">{TYPE_EMOJI[type]}</span>
      </div>

      {/* ===== طبقة زجاجية علوية (شريط الحالة) ===== */}
      <div className="fcard__top-glass">
        <span className={`fcard__status ${open ? 'is-on' : 'is-off'}`}>
          <span className="fcard__dot" />
          {open ? 'مفتوح' : 'مغلق'}
        </span>
      </div>

      {/* ===== المحتوى السفلي (زجاج سائل) ===== */}
      <div className="fcard__content">
        <div className="fcard__header">
          <h3 className="fcard__name">{name}</h3>
          <span className="fcard__area">{area}</span>
        </div>
        
        <div className="fcard__footer">
          <div className="fcard__hook">
            <span className="fcard__hook-dot" />
            <span>{displayHook}</span>
          </div>
          <div className="fcard__arrow">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  )
}
