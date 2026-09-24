import Link from 'next/link'
import './snap-strip.css'

export type StripBusiness = {
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
  variant: 'offers' | 'new'
  businesses: StripBusiness[]
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

function coverOf(b: StripBusiness): string {
  const direct = b.cover || b.cover_url || b.cover_image_url
  if (direct) {
    if (direct.includes('res.cloudinary.com') && !direct.includes('/upload/f_')) {
      return direct.replace('/upload/', '/upload/f_auto,q_auto:eco,w_440,h_330,c_fill/')
    }
    return direct
  }
  if (Array.isArray(b.gallery) && b.gallery.length) return b.gallery[0]
  if (Array.isArray(b.menu) && b.menu.length) return b.menu[0]
  return b.logo || b.logo_url || ''
}

const META = {
  offers: { title: '🎁 عروض حلوة', sub: 'وفّر على طلبك', href: '/offers', badge: 'عرض' },
  new:    { title: '✨ جديد — محتاج فرصتنا', sub: 'أخواتنا اللي بيبدأوا — ادعمهم', href: '/new', badge: 'جديد' },
}

export default function SnapStrip({ variant, businesses, totalCount }: Props) {
  const meta = META[variant]
  const list = businesses.slice(0, 10)
  const total = totalCount ?? businesses.length
  const remaining = Math.max(0, total - list.length)

  return (
    <section className={`fstrip fstrip--${variant}`}>
      <header className="fstrip__head">
        <div>
          <h2 className="fstrip__title">{meta.title}</h2>
          <p className="fstrip__subtitle">{meta.sub}</p>
        </div>
        <Link href={meta.href} className="fstrip__all">
          {list.length > 0 && remaining > 0 ? `+${remaining}` : 'شوف الكل'} ←
        </Link>
      </header>

      {list.length === 0 ? (
        <div className="fstrip__empty">
          {variant === 'offers' ? 'مفيش عروض حالياً' : 'مفيش جديد حالياً'}
        </div>
      ) : (
        <div className="fstrip__track">
          {list.map((b) => {
            const cover = coverOf(b)
            const rating = b.avg_rating ?? b.rating ?? 0
            const label = typeLabel(b.type)
            const href = `/businesses/${encodeURIComponent(b.slug)}`
            return (
              <Link key={b.slug} href={href} className="fstrip__card">
                <div className="fstrip__media">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" loading="lazy" decoding="async" className="fstrip__img" />
                  ) : null}
                  <span className="fstrip__badge">{meta.badge}</span>
                </div>
                <div className="fstrip__body">
                  <span className="fstrip__name">{b.name}</span>
                  <span className="fstrip__meta">
                    <span>{label}</span>
                    {rating > 0 ? <span className="fstrip__rating">★ {rating.toFixed(1)}</span> : null}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
