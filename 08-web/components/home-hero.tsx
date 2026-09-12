'use client'
import EahLogo from './eah-logo'
import { IconSearch } from './neon-icons'
import './home-hero.css'

export default function HomeHero() {
  return (
    <section className="home-hero">
      <div className="home-hero__inner">
        <div className="home-hero__logo">
          <EahLogo size="xl" variant="full" />
        </div>

        <div className="home-hero__city">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>جمهورية شبين القناطر تتحدث...</span>
        </div>

        <div className="home-hero__search">
          <span className="home-hero__search-icon" aria-hidden><IconSearch /></span>
          <input
            type="text"
            placeholder="ابحث عن مطعم، صيدلية، سوبر ماركت، عرض..."
            aria-label="ابحث في EAH"
          />
          <button type="button" className="home-hero__search-btn">ابحث</button>
        </div>

        <div className="home-hero__chips">
          <a href="#restaurants" className="home-hero__chip">
            <span>🍽️</span><span>مطاعم</span>
          </a>
          <a href="#pharmacies" className="home-hero__chip">
            <span>💊</span><span>صيدليات</span>
          </a>
          <a href="#markets" className="home-hero__chip">
            <span>🛒</span><span>سوبر ماركت</span>
          </a>
          <a href="#delivery" className="home-hero__chip">
            <span>🛵</span><span>توصيل</span>
          </a>
          <a href="/recommend" className="home-hero__chip home-hero__chip--accent">
            <span>✨</span><span>نفسك في ايه؟</span>
          </a>
        </div>
      </div>
    </section>
  )
}
