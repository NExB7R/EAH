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
  }
  stats: Stats
}) {
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

      <div className="bhero__inner">
        <div className="bhero__cover">
          <div className="bhero__cover-glow" aria-hidden />
          <span className="bhero__icon" aria-hidden>
            {(() => { const Icon = TYPE_ICON[business.type]; return <Icon /> })()}
          </span>

        </div>

        <div className="bhero__info">
          <h1 className="bhero__name">{business.name}</h1>

          <div className="bhero__meta">
            <span className="bhero__meta-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {business.area}
            </span>
            {stats.review_count > 0 && (
              <span className="bhero__meta-item">
                <span className="bhero__star">★</span>
                <strong>{stats.avg_rating.toFixed(1)}</strong>
                <span className="bhero__count">({stats.review_count})</span>
              </span>
            )}
            {stats.active_offers > 0 && (
              <span className="bhero__meta-item bhero__meta-item--offer">
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

          {(() => {
            const cleaned = business.vibe.filter(
              (v) => !['مميز', 'الأعلى تقييماً', 'عرض', 'مناسب ليك'].includes(v)
            )
            if (cleaned.length === 0) return null
            return (
              <div className="bhero__vibes">
                {cleaned.map((v) => (
                  <span key={v} className="bhero__vibe">#{v}</span>
                ))}
              </div>
            )
          })()}
        </div>
      </div>
    </section>
  )
}
