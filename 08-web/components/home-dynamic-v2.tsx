import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { loadUserProfileTags, parseUserTags, applyPersonalization } from '@/lib/personalization'
import { getViewStats } from '@/lib/real-stats'
import { COPY } from '@/lib/copy'

import HomeHero from '@/components/home-hero'
import SectionSliderV2 from '@/components/section-slider-v2'
import ExploreCardV5 from '@/components/explore-card-v5'

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

  const restaurants = diversified.filter((b: any) => b.type === 'restaurant')
  const pharmacies = diversified.filter((b: any) => b.type === 'pharmacy')
  const delivery = diversified.filter((b: any) => b.type === 'delivery_office')
  const offers = diversified.filter((b: any) => (b.activeOffers ?? 0) > 0)
  const newBiz = diversified.filter((b: any) => (b.ageInDays ?? 0) < 30)
  const featured = diversified.filter((b: any) => b.badge === 'مميز' || b.isFeatured)

  return (
    <>
      <HomeHero />

      {featured.length > 0 && (
        <SectionSliderV2
          title="⭐ المميزين"
          subtitle="أماكن تستاهل"
          seeAllHref="/featured"
          variant="featured"
        >
          {featured.slice(0, 8).map((b: any) => (
            <ExploreCardV5 key={b.slug} business={b} />
          ))}
        </SectionSliderV2>
      )}

      {restaurants.length > 0 && (
        <SectionSliderV2
          title="🔥 ترند المطاعم"
          subtitle="الناس بتدور عليها دلوقتي"
          seeAllHref="/explore?type=restaurant"
          variant="trending"
        >
          {restaurants.slice(0, 10).map((b: any) => (
            <ExploreCardV5 key={b.slug} business={b} />
          ))}
        </SectionSliderV2>
      )}

      {offers.length > 0 && (
        <SectionSliderV2
          title="🎁 عروض النهاردة"
          subtitle="على الآخر"
          seeAllHref="/offers"
          variant="offers"
        >
          {offers.slice(0, 10).map((b: any) => (
            <ExploreCardV5 key={b.slug} business={b} />
          ))}
        </SectionSliderV2>
      )}

      {newBiz.length > 0 && (
        <SectionSliderV2
          title="🌱 أخواتنا اللي بيبدأوا"
          subtitle="دعم للجديد — فرصته معاك"
          seeAllHref="/new"
          variant="new"
        >
          {newBiz.slice(0, 10).map((b: any) => (
            <ExploreCardV5 key={b.slug} business={b} />
          ))}
        </SectionSliderV2>
      )}

      {pharmacies.length > 0 && (
        <SectionSliderV2
          title="💊 الصيدليات"
          subtitle="قرب منك وقت الحاجة"
          seeAllHref="/explore?type=pharmacy"
          variant="new"
        >
          {pharmacies.slice(0, 10).map((b: any) => (
            <ExploreCardV5 key={b.slug} business={b} />
          ))}
        </SectionSliderV2>
      )}

      {delivery.length > 0 && (
        <SectionSliderV2
          title="🛵 التوصيل"
          subtitle="طلبك في السكة"
          seeAllHref="/explore?type=delivery_office"
          variant="trending"
        >
          {delivery.slice(0, 10).map((b: any) => (
            <ExploreCardV5 key={b.slug} business={b} />
          ))}
        </SectionSliderV2>
      )}

      {/* CTA for merchants */}
      <section className="home-merchant-cta" style={{
        maxWidth: 720,
        margin: '40px auto',
        padding: '32px 24px',
        borderRadius: 24,
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(232, 199, 154, 0.1), rgba(168, 85, 247, 0.05))',
        border: '1px solid rgba(232, 199, 154, 0.3)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-cairo-play, var(--font-cairo, system-ui))',
          fontSize: '1.35rem',
          fontWeight: 900,
          color: '#F4F2FA',
          margin: '0 0 8px',
        }}>
          🏪 عندك نشاط؟
        </h2>
        <p style={{
          fontFamily: 'var(--font-cairo, system-ui)',
          fontSize: '0.88rem',
          color: '#C9C2DB',
          margin: '0 0 18px',
          lineHeight: 1.7,
        }}>
          سجّل معانا مجاناً — بدون عمولة على الطلبات
        </p>
        <Link href="/merchant/apply" style={{
          display: 'inline-block',
          padding: '12px 28px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #E8C79A, #A67C52)',
          color: '#1A0F0A',
          fontWeight: 900,
          fontSize: '0.9rem',
          textDecoration: 'none',
          boxShadow: '0 8px 22px rgba(232, 199, 154, 0.4)',
        }}>
          🚀 سجّل نشاطك
        </Link>
      </section>
    </>
  )
}
