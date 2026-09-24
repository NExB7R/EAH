import { unstable_cache } from 'next/cache'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { loadUserProfileTags, parseUserTags, applyPersonalization } from '@/lib/personalization'
import { getViewStats } from '@/lib/real-stats'

import HomeHero from '@/components/home-hero'
import SectionSliderV2 from '@/components/section-slider-v2'
import FeaturedBento from '@/components/featured-bento'
import TrendingList from '@/components/trending-list'
import SnapStrip from '@/components/snap-strip'
import AboutSplit from '@/components/about-split'
import SimpleFlipCard from '@/components/simple-flip-card'
import SeeAllCard from '@/components/see-all-card'
import VisitorValue from '@/components/visitor-value'
import './home-dynamic-v2.css'
import AdSlot from '@/components/ads/ad-slot'
import { getActiveAdForSlot, getAdHref } from '@/lib/ads'

/* ═══════════════════════════════════════════════════════════════
   Helper: Random shuffle (Fisher-Yates)
   ═══════════════════════════════════════════════════════════════ */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* ═══════════════════════════════════════════════════════════════
   Helper: Smart sample — random N with category diversity
   ═══════════════════════════════════════════════════════════════ */
function sampleDiverse<T extends { type?: string }>(arr: T[], n: number): T[] {
  if (arr.length <= n) return shuffle(arr)

  const shuffled = shuffle(arr)
  const result: T[] = []
  const seenTypes = new Map<string, number>()
  const maxPerType = Math.ceil(n / 2) // أقصى 50% من نفس النوع

  for (const item of shuffled) {
    const t = item.type ?? 'other'
    const c = seenTypes.get(t) ?? 0
    if (c < maxPerType) {
      result.push(item)
      seenTypes.set(t, c + 1)
      if (result.length >= n) break
    }
  }

  // لو لسه ناقصين، نكمل بأي عنصر
  if (result.length < n) {
    for (const item of shuffled) {
      if (!result.includes(item)) {
        result.push(item)
        if (result.length >= n) break
      }
    }
  }

  return result
}

const getCachedBusinesses = unstable_cache(
  async () => getPublishedBusinesses(40),
  ['home-businesses-v5'],
  { revalidate: 300, tags: ['businesses'] }
)

const getCachedAd = unstable_cache(
  async () => getActiveAdForSlot('home_banner'),
  ['home-ad-v5'],
  { revalidate: 120, tags: ['ads'] }
)

const getCachedViewStats = unstable_cache(
  async (slugs: string[]) => {
    try {
      const stats = await getViewStats(slugs, 7)
      if (stats instanceof Map) {
        // unstable_cache serializes — convert Map to plain object
        return Object.fromEntries(stats)
      }
      return {}
    } catch {
      return {}
    }
  },
  ['home-viewstats-v1'],
  { revalidate: 300, tags: ['view_stats'] }
)

export default async function HomeDynamicV2() {
  const [businesses, ad, userTags] = await Promise.all([
    getCachedBusinesses(),
    getCachedAd(),
    loadUserProfileTags(),
  ])

  // ═══ View stats ═══
  const slugs = businesses.map((b) => b.slug)
  const statsObj = await getCachedViewStats(slugs)
  const realStats = new Map<string, { views: number }>(
    Object.entries(statsObj).map(([k, v]) => [k, v as { views: number }])
  )

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
  const lowInventory = total <= 3

  // ═══════════════════════════════════════════════════════════
  // المميزين — كل المميزين (عشوائي) — عرض عادل للمدفوع
  // ═══════════════════════════════════════════════════════════
  const featuredAll = diversified.filter((b) => b.badge === 'مميز' || b.isFeatured)
  const featured = shuffle(featuredAll) // عشوائي عشان كل المدفوع ياخد فرصة
  const hasFeatured = !lowInventory && featured.length > 0

  // ═══════════════════════════════════════════════════════════
  // الترند — Top 12 بأعلى score + ترتيب
  // ═══════════════════════════════════════════════════════════
  const trendingTop = [...diversified]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 8)
  const hasTrending = !lowInventory && trendingTop.length > 0

  // ═══════════════════════════════════════════════════════════
  // العروض — Top 10 عروض نشطة
  // ═══════════════════════════════════════════════════════════
  const offersAll = diversified
    .filter((b) => (b.activeOffers ?? 0) > 0)
    .sort((a, b) => (b.activeOffers ?? 0) - (a.activeOffers ?? 0))
  const offersTop = offersAll.slice(0, 8)
  const hasOffers = !lowInventory && offersTop.length > 0

  // ═══════════════════════════════════════════════════════════
  // الجديد — 15 عشوائي (فرص عادلة) من آخر 30 يوم
  // ═══════════════════════════════════════════════════════════
  const newAll = diversified.filter(
    (b) => (b.ageInDays ?? 999) < 30 && !(b as any).is_new_project
  )
  const newOnes = sampleDiverse(newAll, 8)
  const hasNew = !lowInventory && newOnes.length > 0

  // ═══ Fallback: لو المحتوى قليل ═══
  const hasUnified = lowInventory && total > 0

  const adHref = ad ? getAdHref(ad) : '#'

  return (
    <>
      <HomeHero />

      {ad ? (
        <AdSlot ad={ad} href={adHref} />
      ) : (
        <div className="home-ad-placeholder">
          <div className="home-ad-placeholder__inner">
            <span className="home-ad-placeholder__label">مساحة إعلانية</span>
            <span className="home-ad-placeholder__name">Home Banner</span>
            <span className="home-ad-placeholder__size">1200 × 200</span>
          </div>
        </div>
      )}

      {/* ═══ Unified (Low inventory) ═══ */}
      {hasUnified && (
        <SectionSliderV2
          title="اكتشف على EAH"
          subtitle={total === 1 ? 'أول مكان معانا — قريب كمان في السكة' : 'كل الأماكن اللي عندنا دلوقتي'}
          seeAllHref="/explore"
          variant="featured"
        >
          {diversified.map((b) => (
            <SimpleFlipCard key={b.slug} business={b} variant="default" />
          ))}
          <SeeAllCard
            href="/explore"
            label="اكتشف كل الأماكن"
            count={total}
            variant="default"
            ctaText="ابدأ الاستكشاف"
          />
        </SectionSliderV2>
      )}

      {/* ═══ ⭐ المميزين — كل المميزين عشوائي ═══ */}
      {featured.length > 0 && (
        <FeaturedBento businesses={featured} totalCount={featuredAll.length} />
      )}

      {/* ═══ 🔥 الترند — Top 12 + Teaser ═══ */}
      {trendingTop.length > 0 && (
        <TrendingList businesses={trendingTop} totalCount={diversified.length} />
      )}

      {/* ═══ 🎁 العروض — Top 10 + Teaser ═══ */}
      <SnapStrip variant="offers" businesses={offersTop} totalCount={offersAll.length} />

      {/* ═══ ✨ الجديد — 15 عشوائي + Teaser ═══ */}
      <SnapStrip variant="new" businesses={newOnes} totalCount={newAll.length} />

      <AboutSplit />
      <VisitorValue />
    </>
  )
}
