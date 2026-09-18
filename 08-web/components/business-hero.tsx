'use client'
import Link from 'next/link'
import './business-hero.css'
import { IcRestaurant, IcPharmacy, IcMarket, IcDelivery } from './eah-icons'

type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'

const TYPE_ICON: Record<BusinessType, React.ComponentType> = {
  restaurant: IcRestaurant,
  pharmacy: IcPharmacy,
  delivery_office: IcDelivery,
  supermarket: IcMarket,
}

const TYPE_LABEL: Record<BusinessType, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  delivery_office: 'توصيل',
  supermarket: 'ماركت',
}

type Stats = {
  avg_rating: number
  review_count: number
  active_offers: number
}

export default function BusinessHero({
  business,
  stats,
}: {
  business: {
    name: string
    slug: string
    type: BusinessType
    area: string
    reason: string
    open: boolean
    vibe: string[]
    address?: string | null
    workingHours?: any
    coverImage?: string | null
  }
  stats: Stats
}) {
  const cover = business.coverImage ?? null
  const Icon = TYPE_ICON[business.type]

  return (
    <section className="bhero">
      <div className="bhero__back">
        <Link href="/explore" className="bhero__back-btn">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          رجوع للاكتشاف
        </Link>
      </div>

      <div className={`bhero__inner ${cover ? 'has-cover' : ''}`}>
        <div
          className="bhero__cover"
          style={cover ? { backgroundImage: `url(${cover})` } : undefined}
        >
          {cover && <div className="bhero__cover-overlay" aria-hidden />}
          <div className="bhero__cover-glow" aria-hidden />
          {!cover && (
            <span className="bhero__icon" aria-hidden>
              <Icon />
            </span>
          )}
          {cover && (
            <span className="bhero__cover-badge e-badge e-badge--accent" aria-hidden>
              <Icon />
            </span>
          )}
        </div>

        <div className="bhero__info">
          <h1 className="bhero__name e-gradient">{business.name}</h1>

          <div className="bhero__meta">
            <span className="bhero__meta-item e-badge e-badge--accent">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {business.area}
            </span>
            <span className={`bhero__meta-item bhero__meta-item--status ${business.open ? 'is-open' : 'is-closed'}`}>
              <span className="bhero__status-dot" aria-hidden />
              {business.open ? 'مفتوح دلوقتي' : 'مقفول حالياً'}
            </span>
            {stats.review_count > 0 && (
              <span className="bhero__meta-item e-badge e-badge--accent">
                <span className="bhero__star">★</span>
                <strong>{stats.avg_rating.toFixed(1)}</strong>
                <span className="bhero__count">({stats.review_count})</span>
              </span>
            )}
            {stats.active_offers > 0 && (
              <span className="bhero__meta-item bhero__meta-item--offer e-badge e-badge--accent">
                {stats.active_offers} عرض نشط
              </span>
            )}
          </div>

          {business.address && (
            <p className="bhero__address">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {business.address}
            </p>
          )}

          <p className="bhero__reason">{business.reason}</p>
        </div>
      </div>
    </section>
  )
}
