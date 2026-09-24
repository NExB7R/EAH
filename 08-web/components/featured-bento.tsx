import Link from 'next/link'
import './featured-bento.css'

export type BentoBusiness = {
  slug: string
  name: string
  type?: string
  area?: string
  cover?: string
  cover_url?: string
  cover_image_url?: string
  gallery?: string[]
  menu?: string[]
  logo?: string
  logo_url?: string
  rating?: number
  avg_rating?: number
  [key: string]: any
}

type Props = {
  businesses: BentoBusiness[]
  totalCount?: number
}

function IcCrown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 18h20l-2-9-5 4-3-7-3 7-5-4z" />
    </svg>
  )
}

function typeLabel(t?: string): string {
  if (t === 'restaurant') return 'مطعم'
  if (t === 'pharmacy') return 'صيدلية'
  if (t === 'delivery_office') return 'توصيل'
  if (t === 'supermarket') return 'ماركت'
  if (t === 'misc') return 'متجر'
  return 'مكان'
}

function coverOf(b: BentoBusiness): string {
  const direct = b.cover || b.cover_url || b.cover_image_url
  if (direct) {
    if (direct.includes('res.cloudinary.com') && !direct.includes('/upload/f_')) {
      return direct.replace('/upload/', '/upload/f_auto,q_auto:eco,w_600,h_500,c_fill/')
    }
    return direct
  }
  if (Array.isArray(b.gallery) && b.gallery.length) return b.gallery[0]
  if (Array.isArray(b.menu) && b.menu.length) return b.menu[0]
  return b.logo || b.logo_url || ''
}

export default function FeaturedBento({ businesses, totalCount }: Props) {
  const list = businesses.slice(0, 8)
  const total = totalCount ?? businesses.length
  const remaining = Math.max(0, total - list.length)

  if (list.length === 0) {
    return (
      <section className="fbento">
        <header className="fbento__head">
          <div>
            <h2 className="fbento__title">👑 المميزين</h2>
            <p className="fbento__subtitle">قريب هتلاقي هنا أماكن اختارها فريقنا</p>
          </div>
        </header>
        <div className="fbento__empty">مفيش مميزين حالياً — قريب نضيف</div>
      </section>
    )
  }

  return (
    <section className="fbento">
      <header className="fbento__head">
        <div>
          <h2 className="fbento__title">👑 المميزين</h2>
          <p className="fbento__subtitle">أماكن اختارها فريقنا — على مستوى عالي</p>
        </div>
        <Link href="/featured" className="fbento__all">
          {remaining > 0 ? `+${remaining}` : 'شوف الكل'} ←
        </Link>
      </header>

      <div className="fbento__grid">
        {list.map((b, idx) => {
          const cover = coverOf(b)
          const rating = b.avg_rating ?? b.rating ?? 0
          const label = typeLabel(b.type)
          const isLarge = idx < 2
          const sizeClass = isLarge ? 'fbento__card--lg' : 'fbento__card--sm'
          const href = `/businesses/${encodeURIComponent(b.slug)}`

          return (
            <Link
              key={b.slug}
              href={href}
              className={`fbento__card ${sizeClass}`}
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="fbento__img"
                />
              ) : (
                <div className="fbento__ph" aria-hidden />
              )}
              <div className="fbento__grad" />
              <span className="fbento__badge">
                <IcCrown /> مميز
              </span>
              <div className="fbento__info">
                <h3 className="fbento__name">{b.name}</h3>
                <div className="fbento__meta">
                  <span className="fbento__type">{label}</span>
                  {rating > 0 ? (
                    <span className="fbento__rating">★ {rating.toFixed(1)}</span>
                  ) : null}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
