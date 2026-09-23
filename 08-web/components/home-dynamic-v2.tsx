import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { loadUserProfileTags, parseUserTags, applyPersonalization } from '@/lib/personalization'
import { getViewStats } from '@/lib/real-stats'

import HomeHero from '@/components/home-hero'
import SectionSliderV2 from '@/components/section-slider-v2'
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

export default async function HomeDynamicV2() {
  // ═══ Data (no unstable_cache — cookies() incompatible) ═══
  const [businesses, ad, userTags] = await Promise.all([
    getPublishedBusinesses(100),
    getActiveAdForSlot('home_banner'),
    loadUserProfileTags(),
  ])

  // ═══ View stats ═══
  const slugs = businesses.map((b) => b.slug)
  let realStats: Map<string, { views: number }> = new Map()
  try {
    const stats = await getViewStats(slugs, 7)
    if (stats instanceof Map) realStats = stats as Map<string, { views: number }>
  } catch {
    realStats = new Map()
  }

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
    .slice(0, 12)
  const hasTrending = !lowInventory && trendingTop.length > 0

  // ═══════════════════════════════════════════════════════════
  // العروض — Top 10 عروض نشطة
  // ═══════════════════════════════════════════════════════════
  const offersAll = diversified
    .filter((b) => (b.activeOffers ?? 0) > 0)
    .sort((a, b) => (b.activeOffers ?? 0) - (a.activeOffers ?? 0))
  const offersTop = offersAll.slice(0, 10)
  const hasOffers = !lowInventory && offersTop.length > 0

  // ═══════════════════════════════════════════════════════════
  // الجديد — 15 عشوائي (فرص عادلة) من آخر 30 يوم
  // ═══════════════════════════════════════════════════════════
  const newAll = diversified.filter(
    (b) => (b.ageInDays ?? 999) < 30 && !(b as any).is_new_project
  )
  const newOnes = sampleDiverse(newAll, 15)
  const hasNew = !lowInventory && newOnes.length > 0

  // ═══ Fallback: لو المحتوى قليل ═══
  const hasUnified = lowInventory && total > 0

  const adHref = ad ? getAdHref(ad) : '#'

  return (
    <>
      <HomeHero />

      {ad && <AdSlot ad={ad} href={adHref} />}

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
      {hasFeatured && (
        <SectionSliderV2
          title="المميزين"
          subtitle="أماكن اختارها فريقنا — على مستوى عالي"
          seeAllHref="/featured"
          variant="featured"
        >
          {featured.map((b) => (
            <SimpleFlipCard key={b.slug} business={b} variant="featured" />
          ))}
          {featured.length >= 4 && (
            <SeeAllCard
              href="/featured"
              label="شوف كل المميزين"
              count={featuredAll.length}
              variant="featured"
              ctaText="اكتشف المميزين"
            />
          )}
        </SectionSliderV2>
      )}

      {/* ═══ 🔥 الترند — Top 12 + Teaser ═══ */}
      {hasTrending && (
        <SectionSliderV2
          title="الترند النهاردة"
          subtitle="الناس بتدور عليها دلوقتي"
          seeAllHref="/trends"
          variant="trending"
        >
          {trendingTop.map((b, i) => (
            <SimpleFlipCard key={b.slug} business={b} variant="trending" rank={i + 1} />
          ))}
          <SeeAllCard
            href="/trends"
            label="شوف الترند الكامل"
            count={diversified.length}
            variant="trending"
            ctaText="كل الترند"
          />
        </SectionSliderV2>
      )}

      {/* ═══ 🎁 العروض — Top 10 + Teaser ═══ */}
      {hasOffers && (
        <SectionSliderV2
          title="عروض حلوة"
          subtitle="وفّر على طلبك"
          seeAllHref="/offers"
          variant="offers"
        >
          {offersTop.map((b) => (
            <SimpleFlipCard key={b.slug} business={b} variant="offers" />
          ))}
          <SeeAllCard
            href="/offers"
            label="شوف كل العروض"
            count={offersAll.length}
            variant="offers"
            ctaText="كل العروض"
          />
        </SectionSliderV2>
      )}

      {/* ═══ ✨ الجديد — 15 عشوائي + Teaser ═══ */}
      {hasNew && (
        <SectionSliderV2
          title="جديد — محتاج فرصتنا"
          subtitle="أخواتنا اللي بيبدأوا — ادعمهم"
          seeAllHref="/new"
          variant="new"
        >
          {newOnes.map((b) => (
            <SimpleFlipCard key={b.slug} business={b} variant="new" />
          ))}
          {newAll.length > 15 && (
            <SeeAllCard
              href="/new"
              label="شوف كل الجديد"
              count={newAll.length}
              variant="new"
              ctaText="ادعم الجديد"
            />
          )}
        </SectionSliderV2>
      )}

      <VisitorValue />
    </>
  )
}
