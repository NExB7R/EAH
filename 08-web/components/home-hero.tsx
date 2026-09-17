'use client'
import Link from 'next/link'
import EahLogo from './eah-logo'
import SearchBar from './search-bar'
import { IcRestaurant, IcPharmacy, IcMarket, IcDelivery } from './eah-icons'
import './home-hero.css'

const CATEGORIES = [
  { type: 'restaurant', Icon: IcRestaurant, label: 'مطاعم' },
  { type: 'pharmacy', Icon: IcPharmacy, label: 'صيدليات' },
  { type: 'supermarket', Icon: IcMarket, label: 'ماركت' },
  { type: 'delivery_office', Icon: IcDelivery, label: 'توصيل' },
]

export default function HomeHero() {
  return (
    <section className="hh">
      <div className="hh__inner">
        <div className="hh__logo">
          <EahLogo size="xl" variant="full" href="/" />
        </div>

        <div className="hh__tagline">
          <span className="hh__tagline-pin" aria-hidden></span>
          <span className="hh__tagline-city">شبين القناطر بتحكي — وإحنا كلنا بنسمع</span>
        </div>

        <h2 className="hh__hook">كل حاجة محتاجها — في مكان واحد</h2>

        <div className="hh__search">
          <SearchBar placeholder="مطعم؟ صيدلية؟ ماركت؟ دوّر..." />
        </div>

        <nav className="hh__cats" aria-label="تصفح سريع">
          {CATEGORIES.map((c) => (
            <Link key={c.type} href={`/explore?type=${c.type}`} className="hh__cat">
              <span className="hh__cat-icon"><c.Icon /></span>
              <span className="hh__cat-label">{c.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
