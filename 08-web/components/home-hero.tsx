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
      <div className="hh__bg" aria-hidden>
        <span className="hh__blob hh__blob--a" />
        <span className="hh__blob hh__blob--b" />
        <span className="hh__grid" />
      </div>

      <div className="hh__inner">
        {/* Top welcome chip */}
        <div className="hh__chip-top">
          <span className="hh__chip-top-dot" />
          <span>أهلاً بيك في EAH — شبين القناطر والقرى حواليها</span>
        </div>

        {/* Logo */}
        <div className="hh__logo">
          <EahLogo size="lg" variant="full" href="/" />
        </div>

        {/* Headline */}
        <h1 className="hh__h1">
          كل اللي حواليك
          <br />
          <span className="hh__h1-accent">في مكان واحد</span>
        </h1>

        <p className="hh__sub">
          اكتشف مطاعم، صيدليات، ماركت، وتوصيل
          <br className="hh__br" />
          بذكاء يخصّك — من غير أي تعقيد
        </p>

        {/* Search */}
        <div className="hh__search">
          <SearchBar placeholder="ابحث عن مطعم، صيدلية، أو ماركت..." />
        </div>

        {/* Categories quick access */}
        <nav className="hh__cats" aria-label="تصفح سريع">
          {CATEGORIES.map((c) => (
            <Link
              key={c.type}
              href={`/explore?type=${c.type}`}
              className="hh__cat"
            >
              <span className="hh__cat-emoji">{c.emoji}</span>
              <span className="hh__cat-label">{c.label}</span>
            </Link>
          ))}
        </nav>

        {/* Recommend CTA */}
        <Link href="/recommend" className="hh__recommend">
          <span className="hh__recommend-emoji">✨</span>
          <span className="hh__recommend-body">
            <strong>مش عارف تختار؟</strong>
            <small>خلّي EAH ترشحلك على مزاجك</small>
          </span>
          <span className="hh__recommend-arrow">←</span>
        </Link>

        {/* Trust strip */}
        <div className="hh__trust">
          <span className="hh__trust-item">
            <span className="hh__trust-dot" />
            مجاني 100% للعميل
          </span>
          <span className="hh__trust-item">
            <span className="hh__trust-dot" />
            بدون تسجيل مطلوب
          </span>
          <span className="hh__trust-item">
            <span className="hh__trust-dot" />
            أماكن موثوقة
          </span>
        </div>
      </div>
    </section>
  )
}
