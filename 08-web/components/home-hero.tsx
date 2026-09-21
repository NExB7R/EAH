'use client'
import Link from 'next/link'
import EahLogo from './eah-logo'
import SearchBar from './search-bar'
import { IcRestaurant, IcPharmacy, IcDelivery, IcPin } from './eah-icons'
import './home-hero.css'

const CATEGORIES = [
  { type: 'restaurant', Icon: IcRestaurant, label: 'مطاعم' },
  { type: 'pharmacy', Icon: IcPharmacy, label: 'صيدليات' },
  { type: 'delivery_office', Icon: IcDelivery, label: 'توصيل' },
]

export default function HomeHero() {
  return (
    <section className="hh">
      <div className="hh__inner">
        <div className="hh__logo">
          <EahLogo size="xl" variant="full" href="/" />
        </div>

        <div className="hh__slogan">
          <span className="hh__slogan-text">اللي نفسك فيه ؟</span>
        </div>

        <div className="hh__tagline">
          <span className="hh__tagline-pin" aria-hidden><IcPin /></span>
          <span className="hh__tagline-city">من قلب شبين القناطر</span>
        </div>

        <div className="hh__hook">
          <span className="hh__hook-line">شبيك لبيك</span>
          <span className="hh__hook-sub-line">كل حاجة حواليك</span>
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
