'use client'
import EahLogo from './eah-logo'
import { IconSearch } from './neon-icons'
import './home-hero.css'

export default function HomeHero() {
  return (
    <section className="home-hero">
      <div className="home-hero__inner">
        <div className="home-hero__logo"><EahLogo size="xl" variant="full" /></div>

        <div className="home-hero__city">
          <span className="home-hero__city-line" aria-hidden />
          <span className="home-hero__city-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <span className="home-hero__city-text">دولة شبين القناطر</span>
          <span className="home-hero__city-line" aria-hidden />
        </div>

        <div className="home-hero__search">
          <span className="home-hero__search-icon" aria-hidden><IconSearch /></span>
          <input
            type="text"
            placeholder="ابحث عن مطعم، صيدلية، عرض..."
            aria-label="ابحث في EAH"
          />
          <button type="button" className="home-hero__search-btn">ابحث</button>
        </div>

        <div className="home-hero__chips">
          <a href="/explore?type=restaurant" className="home-hero__chip">
            <span>🍽️</span><span>مطاعم</span>
          </a>
          <a href="/explore?type=pharmacy" className="home-hero__chip">
            <span>💊</span><span>صيدليات</span>
          </a>
          <a href="/explore?type=delivery_office" className="home-hero__chip">
            <span>🛵</span><span>توصيل</span>
          </a>
        </div>

        <a href="/recommend" className="home-hero__mood-box">
          <span className="home-hero__mood-emoji">✨</span>
          <span className="home-hero__mood-text">
            <strong>نفسك في ايه؟</strong>
            <small>قولنا وإحنا نرشّحلك المكان المناسب</small>
          </span>
          <span className="home-hero__mood-arrow" aria-hidden>←</span>
        </a>
      </div>
    </section>
  )
}
