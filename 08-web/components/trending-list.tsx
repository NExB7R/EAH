import Link from 'next/link'
import './trending-list.css'

export type TrendingBusiness = {
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
  businesses: TrendingBusiness[]
  totalCount?: number
}

function typeLabel(t?: string): string {
  if (t === 'restaurant') return 'مطعم'
  if (t === 'pharmacy') return 'صيدلية'
  if (t === 'delivery_office') return 'توصيل'
  if (t === 'supermarket') return 'ماركت'
  if (t === 'misc') return 'متجر'
  return 'مكان'
}

function coverOf(b: TrendingBusiness): string {
  const direct = b.cover || b.cover_url || b.cover_image_url
  if (direct) {
    if (direct.includes('res.cloudinary.com') && !direct.includes('/upload/f_')) {
      return direct.replace('/upload/', '/upload/f_auto,q_auto:eco,w_88,h_88,c_fill/')
    }
    return direct
  }
  if (Array.isArray(b.gallery) && b.gallery.length) return b.gallery[0]
  if (Array.isArray(b.menu) && b.menu.length) return b.menu[0]
  return b.logo || b.logo_url || ''
}

export default function TrendingList({ businesses, totalCount }: Props) {
  const list = businesses.slice(0, 10)
  const total = totalCount ?? businesses.length
  const remaining = Math.max(0, total - list.length)

  if (list.length === 0) return null

  return (
    <section className="ftlist">
      <header className="ftlist__head">
        <div>
          <h2 className="ftlist__title">🔥 الترند النهاردة</h2>
          <p className="ftlist__subtitle">الناس بتدور عليها دلوقتي</p>
        </div>
        <Link href="/trends" className="ftlist__all">
          {remaining > 0 ? `+${remaining}` : 'شوف الكل'} ←
        </Link>
      </header>
      <div className="ftlist__rows">
        {list.map((b, idx) => {
          const cover = coverOf(b)
          const rating = b.avg_rating ?? b.rating ?? 0
          const label = typeLabel(b.type)
          const href = `/businesses/${encodeURIComponent(b.slug)}`
          return (
            <Link key={b.slug} href={href} className="ftlist__row">
              <span className="ftlist__rank">{String(idx + 1).padStart(2, '0')}</span>
              <span className="ftlist__media">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" loading="lazy" decoding="async" className="ftlist__img" />
                ) : null}
              </span>
              <span className="ftlist__info">
                <span className="ftlist__name">{b.name}</span>
                <span className="ftlist__meta">
                  <span>{label}</span>
                  {b.area ? <span>· {b.area}</span> : null}
                </span>
              </span>
              {rating > 0 ? (
                <span className="ftlist__trail">
                  <span className="ftlist__rating">★ {rating.toFixed(1)}</span>
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
