'use client'
import Link from 'next/link'
import EahLogo from './eah-logo'
import SearchBar from './search-bar'
import './home-hero.css'

const CATEGORIES = [
  { type: 'restaurant', emoji: '🍽️', label: 'مطاعم' },
  { type: 'pharmacy', emoji: '💊', label: 'صيدليات' },
  { type: 'supermarket', emoji: '🛒', label: 'ماركت' },
  { type: 'delivery_office', emoji: '🛵', label: 'توصيل' },
]



export default function HomeHero() {
  return (
    <section className="hh">
      </div>

      <div className="hh__inner">
        

        <div className="hh__logo">
          <EahLogo size="xl" variant="full" href="/" />
        </div>

        <div className="hh__tagline">
          <span className="hh__tagline-pin" aria-hidden>📍</span>
          <span className="hh__tagline-city">دولة شبين القناطر تتحدّث</span>
        </div>
        <h2 className="hh__hook">EAH بتجمع كل حاجة حواليك في مكان واحد.</h2>

        <div className="hh__search">
          <SearchBar placeholder="مطعم؟ صيدلية؟ ماركت؟ دوّر..." />
        </div>

        <nav className="hh__cats" aria-label="تصفح سريع">
          {CATEGORIES.map((c) => (
            <Link key={c.type} href={`/explore?type=${c.type}`} className="hh__cat">
              <span className="hh__cat-emoji">{c.emoji}</span>
              <span className="hh__cat-label">{c.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
