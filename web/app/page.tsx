import { Suspense } from 'react'
import HomeHero from '@/components/home-hero'
import CategoryChips from '@/components/category-chips'
import FeaturedBento from '@/components/featured-bento'
import TrendingRow from '@/components/trending-row'
import OffersStrip from '@/components/offers-strip'
import NewRow from '@/components/new-row'
import NearbyGrid from '@/components/nearby-grid'
import SuggestedSection from '@/components/suggested-section'
import AdSlot from '@/components/ad-slot'
import ChipScrollHandler from '@/components/chip-scroll-handler'
import {
  getPublishedBusinesses,
  getFeaturedBusinesses,
  getActiveOffers,
} from '@/lib/data'
import { getFeatureFlags } from '@/lib/features'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness } from '@/lib/data/merchant'
import { getFavoriteIds } from '@/lib/data/account'
import { getActiveAdsForSlot } from '@/lib/data/ads'
import { fairOrder, fairOrderOffers } from '@/lib/fair-ranking'
import { isOpenNow } from '@/lib/data/businesses'
import type { Business } from '@/lib/data'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ type?: string; scroll?: string; chip?: string }>
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams
  const session = await getUserSession()
  const business = session ? await getMyBusiness(session.userId) : null

  return (
    <main>
      <ChipScrollHandler target={params.scroll} />
      <HomeHero isLoggedIn={!!session} hasBusiness={!!business} />
      <CategoryChips />
      <Suspense fallback={null}>
        <HomeSections typeFilter={params.type} />
      </Suspense>
    </main>
  )
}

async function HomeSections({ typeFilter }: { typeFilter?: string }) {
  const session = await getUserSession()
  const [allRaw, featuredRaw, rawOffers, flags, homeBanner, homeFeed, favoriteIds] =
    await Promise.all([
      getPublishedBusinesses(),
      getFeaturedBusinesses(),
      getActiveOffers(30),
      getFeatureFlags(),
      getActiveAdsForSlot('home_banner', 1),
      getActiveAdsForSlot('home_feed', 1),
      session ? getFavoriteIds(session.userId) : Promise.resolve(new Set<string>()),
    ])

  // ─── الفلترة ───
  const applyHomeFilter = (businesses: Business[]) => {
    if (typeFilter === 'open') {
      return businesses.filter((b) => isOpenNow(b.working_hours))
    }
    if (typeFilter === 'online') {
      return businesses.filter((b) => b.accepts_whatsapp_orders)
    }
    if (typeFilter && typeFilter !== 'all') {
      return businesses.filter((b) => b.business_type === typeFilter)
    }
    return businesses
  }
  const all = applyHomeFilter(allRaw)

  const offers = fairOrderOffers(rawOffers, 8)

  const featured = fairOrder(
    applyHomeFilter(featuredRaw),
    'featured',
    {},
    { topWindow: 8, maxPerType: 2 },
  )

  const trending = fairOrder(all, 'trending', {}, { topWindow: 8, maxPerType: 2 })

  const newOnes = fairOrder(
    all.filter((b) => b.is_new_project),
    'new',
    {},
    { topWindow: 8, maxPerType: 2 },
  )

  const nearby = fairOrder(
    all.filter((b) => b.area === 'شبين القناطر'),
    'nearby',
    { area: 'شبين القناطر' },
    { topWindow: 8, maxPerType: 2 },
  )

  const featuredMerged: Business[] = featured

  return (
    <>
      {flags.featured_enabled && <FeaturedBento businesses={featuredMerged} />}
      {homeBanner.length > 0 && (
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px' }}>
          <AdSlot ads={homeBanner} variant="banner" />
        </div>
      )}
      {flags.trends_enabled && trending.length >= 2 && (
        <div id="trending">
          <TrendingRow businesses={trending} favoriteIds={favoriteIds} />
        </div>
      )}
      {flags.offers_enabled && (
        <div id="offers">
          <OffersStrip offers={offers} />
        </div>
      )}
      {homeFeed.length > 0 && (
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px' }}>
          <AdSlot ads={homeFeed} variant="banner" />
        </div>
      )}
      {flags.new_enabled && (
        <div id="new">
          <NewRow businesses={newOnes} favoriteIds={favoriteIds} />
        </div>
      )}
      {flags.nearby_enabled && (
        <div id="nearby">
          <NearbyGrid businesses={nearby} favoriteIds={favoriteIds} />
        </div>
      )}
      <div id="suggested">
        <SuggestedSection />
      </div>
    </>
  )
}
