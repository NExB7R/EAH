import Link from 'next/link'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { loadUserProfileTags, parseUserTags, applyPersonalization } from '@/lib/personalization'
import { getViewStats } from '@/lib/real-stats'

import HomeHero from '@/components/home-hero'
import SectionSliderV2 from '@/components/section-slider-v2'
import ExploreCardV5 from '@/components/explore-card-v5'
import VisitorValue from '@/components/visitor-value'

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

  return (
    <>
      <HomeHero />

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

      <section className="home-merchant-cta">
        <h2>🏪 عندك نشاط؟</h2>
        <p>سجّل معانا مجاناً — بدون عمولة على الطلبات</p>
        <Link href="/merchant/apply" className="home-merchant-cta__btn">
          🚀 سجّل نشاطك
        </Link>
      </section>

      <style>{`
        .home-merchant-cta {
          max-width: 720px;
          margin: 48px auto;
          padding: 32px 24px;
          border-radius: 24px;
          text-align: center;
          background: linear-gradient(135deg, rgba(232, 199, 154, 0.1), rgba(168, 85, 247, 0.05));
          border: 1px solid rgba(232, 199, 154, 0.3);
        }
        .home-merchant-cta h2 {
          font-family: var(--font-cairo-play, var(--font-cairo, system-ui));
          font-size: 1.35rem;
          font-weight: 900;
          color: #F4F2FA;
          margin: 0 0 8px;
        }
        .home-merchant-cta p {
          font-family: var(--font-cairo, system-ui);
          font-size: 0.88rem;
          color: #C9C2DB;
          margin: 0 0 18px;
          line-height: 1.7;
        }
        .home-merchant-cta__btn {
          display: inline-block;
          padding: 12px 28px;
          border-radius: 12px;
          background: linear-gradient(135deg, #E8C79A, #A67C52);
          color: #1A0F0A;
          font-weight: 900;
          font-size: 0.9rem;
          text-decoration: none;
          box-shadow: 0 8px 22px rgba(232, 199, 154, 0.4);
        }
      `}</style>
    </>
  )
}
