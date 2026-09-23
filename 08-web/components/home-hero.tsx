'use client'
import Link from 'next/link'
import EahLogo from './eah-logo'
import SearchBar from './search-bar'
import { IcRestaurant, IcPharmacy, IcDelivery, IcMarket, IcSparkle } from './eah-icons'
import './home-hero.css'

const CATEGORIES = [
  { type: 'restaurant',      Icon: IcRestaurant, label: 'مطاعم' },
  { type: 'pharmacy',        Icon: IcPharmacy,   label: 'صيدليات' },
  { type: 'delivery_office', Icon: IcDelivery,   label: 'توصيل' },
  { type: 'supermarket',     Icon: IcMarket,     label: 'ماركت' },
  { type: 'misc',            Icon: IcSparkle,    label: 'أنشطة أخرى' },
]

function PinSmall() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export default function HomeHero() {
  return (
    <section className="hh">
      <div className="hh__inner">

        <div className="hh__logo">
          <EahLogo size="xl" variant="full" href="/" />
        </div>

        <div className="hh__slogan" aria-label="اللي نفسك فيه">
          <span className="hh__slogan-text">اللي نفسك فيه ؟</span>
        </div>

        <div className="hh__tagline">
          <span className="hh__tagline-pin" aria-hidden><PinSmall /></span>
          <span className="hh__tagline-city">من قلب شبين القناطر</span>
        </div>

        <div className="hh__hook">
          <span className="hh__hook-line"><span className="hh__hook-motion">شبيك لبيك</span></span>
          <span className="hh__hook-sub-line"><span className="hh__hook-motion">كل حاجة حواليك</span></span>
        </div>

        <div className="hh__search">
          <SearchBar placeholder="بتدوّر على ايه النهاردة؟" />
        </div>

        <nav className="hh__cats" aria-label="تصفح سريع">
          {CATEGORIES.map((c) => {
            const Icon = c.Icon
            return (
              <Link key={c.type} href={`/explore?type=${c.type}`} className="hh__cat">
                <span className="hh__cat-icon"><Icon /></span>
                <span className="hh__cat-label">{c.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </section>
  )
}
