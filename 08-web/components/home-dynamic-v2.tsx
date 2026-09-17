import Link from 'next/link'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { loadUserProfileTags, parseUserTags, applyPersonalization } from '@/lib/personalization'
import { getViewStats } from '@/lib/real-stats'

import HomeHero from '@/components/home-hero'
import SectionSliderV2 from '@/components/section-slider-v2'
import ExploreCardV5 from '@/components/explore-card-v5'
import VisitorValue from '@/components/visitor-value'
import './home-dynamic-v2.css'
import AdSlot from '@/components/ads/ad-slot'
import { getActiveAdForSlot, getAdHref } from '@/lib/ads'

export default async function HomeDynamicV2() {
  const businesses = await getPublishedBusinesses(50)
  const realStats = await getViewStats(businesses.map((b) => b.slug), 7)

  const withStats = businesses.map((b) => {
    const real = realStats.get(b.slug)
    return {
      ...b,
      id: (b as any).businessId ?? b.slug,
      rating: (b as any).rating ?? 0,
      reviewCount: (b as any).reviewCount ?? 0,
      avg_rating: (b as any).avg_rating ?? (b as any).rating ?? 0,
      review_count: (b as any).review_count ?? (b as any).reviewCount ?? 0,
      recentViews: real?.views ?? 0,
      activeOffers: (b as any).activeOffers ?? 0,
      ageInDays: (b as any).ageInDays ?? 0,
      isFeatured: (b as any).featured ?? false,
    }
  })

  const ranked = rankBusinesses(withStats as any, { includeFeaturedBoost: true })
  const userTags = await loadUserProfileTags()
  const userProfile = parseUserTags(userTags)
  const personalized = applyPersonalization(ranked, userProfile)
  const diversified = diversifyByCategory(personalized as any, 'type') as any[]

  // ═══ Featured (mixed across all categories) — sorted by views ═══
  const featured = [...diversified]
    .filter((b) => b.badge === 'مميز' || b.isFeatured)
    .sort((a, b) => (b.recentViews ?? 0) - (a.recentViews ?? 0))
    .slice(0, 12)

  // ═══ Trending (mixed) — sorted by ranking score ═══
  const trending = [...diversified]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 12)

  // ═══ New (mixed) — sorted by newest, under 30 days ═══
  const newOnes = [...diversified]
    .filter((b) => (b.ageInDays ?? 999) < 30)
    .sort((a, b) => (a.ageInDays ?? 999) - (b.ageInDays ?? 999))
    .slice(0, 12)

  const hasFeatured = featured.length > 0
  const hasTrending = trending.length > 0
  const hasNew = newOnes.length > 0

  const ad = await getActiveAdForSlot('home_banner')
  const adHref = ad ? getAdHref(ad) : '#'

  return (
    <>
      <HomeHero />

      {ad && <AdSlot ad={ad} href={adHref} />}

      <VisitorValue />

      {hasFeatured && (
        <SectionSliderV2
          title="⭐ المميزين"
          subtitle="أماكن اختارها فريقنا — على مستوى عالي"
          seeAllHref="/featured"
          variant="featured"
        >
          {featured.map((b) => (
            <ExploreCardV5 key={b.slug} business={b} />
          ))}
        </SectionSliderV2>
      )}

      {hasTrending && (
        <SectionSliderV2
          title="🔥 الترند"
          subtitle="الناس بتدور عليها دلوقتي"
          seeAllHref="/trends"
          variant="trending"
        >
          {trending.map((b) => (
            <ExploreCardV5 key={b.slug} business={b} />
          ))}
        </SectionSliderV2>
      )}

      {hasNew && (
        <SectionSliderV2
          title="🌱 الجديد"
          subtitle="أخواتنا اللي بيبدأوا — ادعمهم"
          seeAllHref="/new"
          variant="new"
        >
          {newOnes.map((b) => (
            <ExploreCardV5 key={b.slug} business={b} />
          ))}
        </SectionSliderV2>
      )}

      <section className="home-actions">
        <div className="home-actions__grid">
          <a href="/merchant/apply" className="home-actions__card home-actions__card--biz">
            <span className="home-actions__icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l1.5-5h15L21 9M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18"/>
                <path d="M8 13v4M12 13v4M16 13v4"/>
              </svg>
            </span>
            <div className="home-actions__body">
              <h3 className="home-actions__title">عندك نشاط؟</h3>
              <p className="home-actions__desc">سجّله مجاناً — بدون عمولة على الطلبات</p>
            </div>
            <span className="home-actions__cta">سجّل نشاطك ←</span>
          </a>
          <a href="/recommend" className="home-actions__card home-actions__card--rec">
            <span className="home-actions__icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>
              </svg>
            </span>
            <div className="home-actions__body">
              <h3 className="home-actions__title">مش عارف تختار؟</h3>
              <p className="home-actions__desc">قول مزاجك وإحنا نظبط</p>
            </div>
            <span className="home-actions__cta">جرّب ←</span>
          </a>
        </div>
      </section>

      
    </>
  )
}
