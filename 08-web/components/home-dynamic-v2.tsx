import { unstable_cache } from 'next/cache'
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

// ═══════════════════════════════════════════════════════════
// Cached queries — كل واحدة بتشتغل مرة كل X دقايق
// ═══════════════════════════════════════════════════════════

const cachedBusinesses = async () => getPublishedBusinesses(50)

const cachedAd = async () => getActiveAdForSlot('home_banner')

export default async function HomeDynamicV2() {
  // ═══ Parallel: cached queries + user tags ═══
  const [businesses, ad, userTags] = await Promise.all([
    cachedBusinesses(),
    cachedAd(),
    loadUserProfileTags(),  // cookie-based — دايماً fresh
  ])

  // ═══ View stats — cached بـ slugs key ═══
  const slugs = businesses.map((b) => b.slug)
  const slugsKey = slugs.sort().join(',')

  const cachedStats = unstable_cache(
    async () => getViewStats(slugs, 7),
    ['home-stats-v1', slugsKey],
    { revalidate: 60, tags: ['view-stats'] }  // دقيقة
  )
  const realStats = await cachedStats()

  const withStats = businesses.map((b) => {
    const real = realStats.get(b.slug)
    return {
      ...b,
      id: b.businessId ?? b.slug,
      rating: b.rating ?? 0,
      reviewCount: b.reviewCount ?? 0,
      recentComments: b.recentComments ?? 0,
      recentViews: real?.views ?? 0,
      activeOffers: b.activeOffers ?? 0,
      ageInDays: b.ageInDays ?? 0,
      isFeatured: b.featured ?? false,
      lastShownAt: undefined,
      totalImpressions: 0,
    }
  })

  const ranked = rankBusinesses(withStats, { includeFeaturedBoost: true })
  const userProfile = parseUserTags(userTags)
  const personalized = applyPersonalization(ranked, userProfile)
  const diversified = diversifyByCategory(personalized as any, 'type') as any[]

  const total = diversified.length

  const featured = [...diversified]
    .filter((b) => b.badge === 'مميز' || b.isFeatured)
    .sort((a, b) => (b.recentViews ?? 0) - (a.recentViews ?? 0))
    .slice(0, 12)

  const trending = [...diversified]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 12)

  // ═══ مشاريع جديدة ═══
  const projects = [...diversified]
    .filter((b: any) => b.is_new_project === true)
    .sort((a: any, b: any) => (a.ageInDays ?? 999) - (b.ageInDays ?? 999))
    .slice(0, 12)

  const newOnes = [...diversified]
    .filter((b) => (b.ageInDays ?? 999) < 30 && !(b as any).is_new_project)
    .sort((a, b) => (a.ageInDays ?? 999) - (b.ageInDays ?? 999))
    .slice(0, 12)

  const lowInventory = total <= 3
  const hasFeatured = !lowInventory && featured.length > 0
  const hasTrending = !lowInventory && trending.length > 0
  const hasNew = !lowInventory && newOnes.length > 0
  const hasProjects = projects.length > 0
  const hasUnified = lowInventory && total > 0

  const adHref = ad ? getAdHref(ad) : '#'

  return (
    <>
      <HomeHero />

      {ad && <AdSlot ad={ad} href={adHref} />}

      {hasUnified && (
        <SectionSliderV2
          title="اكتشف على EAH"
          subtitle={total === 1 ? 'أول مكان معانا — قريب كمان في السكة' : 'كل الأماكن اللي عندنا دلوقتي'}
          seeAllHref="/explore"
          variant="featured"
        >
          {diversified.map((b) => (
            <ExploreCardV5 key={b.slug} business={b} />
          ))}
        </SectionSliderV2>
      )}

      {hasFeatured && (
        <SectionSliderV2
          title="المميزين"
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
          title="الترند"
          subtitle="الناس بتدور عليها دلوقتي"
          seeAllHref="/trends"
          variant="trending"
        >
          {trending.map((b) => (
            <ExploreCardV5 key={b.slug} business={b} />
          ))}
        </SectionSliderV2>
      )}

      {/* ═══ المشاريع الجديدة — بين الترند والجديد ═══ */}
      {hasProjects && (
        <SectionSliderV2
          title="مشاريع جديدة — ادعمها"
          subtitle="فرصتنا مع بعض نبني حاجة من الأول"
          seeAllHref="/projects"
          variant="projects"
          autoAdvanceMs={2200}
        >
          {projects.map((b) => (
            <ExploreCardV5 key={b.slug} business={b} />
          ))}
        </SectionSliderV2>
      )}

      {hasNew && (
        <SectionSliderV2
          title="الجديد"
          subtitle="أخواتنا اللي بيبدأوا — ادعمهم"
          seeAllHref="/new"
          variant="new"
        >
          {newOnes.map((b) => (
            <ExploreCardV5 key={b.slug} business={b} />
          ))}
        </SectionSliderV2>
      )}

      <VisitorValue />
    </>
  )
}
