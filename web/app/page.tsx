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
import { getFeaturedBusinesses, getTrendingBusinesses, getNewBusinesses, getActiveOffers, getNearbyBusinesses } from '@/lib/data'
import { getFeatureFlags } from '@/lib/features'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness } from '@/lib/data/merchant'
import { getFavoriteIds, getFullProfile } from '@/lib/data/account'
import { getActiveAdsForSlot } from '@/lib/data/ads'
import { fairOrder, fairOrderOffers } from '@/lib/fair-ranking'
import { distanceKm } from '@/lib/utils/distance'
import { getHomeRecommendations } from '@/lib/data/home-recommendations'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ scroll?: string; chip?: string }>
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams
  const session = await getUserSession()
  const [business, profile] = session
    ? await Promise.all([getMyBusiness(session.userId), getFullProfile(session.userId)])
    : [null, null]
  const viewerLocation =
    profile?.default_latitude !== null && profile?.default_latitude !== undefined &&
    profile?.default_longitude !== null && profile?.default_longitude !== undefined
      ? { lat: profile.default_latitude, lng: profile.default_longitude }
      : null

  return (
    <main>
      <ChipScrollHandler target={params.scroll} />
      <HomeHero isLoggedIn={!!session} hasBusiness={!!business} />
      <CategoryChips />
      <Suspense fallback={null}>
        <HomeSections
          isLoggedIn={!!session}
          viewerLocation={viewerLocation}
          viewerArea={profile?.default_area ?? null}
        />
      </Suspense>
    </main>
  )
}

async function HomeSections({
  isLoggedIn,
  viewerLocation,
  viewerArea,
}: {
  isLoggedIn: boolean
  viewerLocation: { lat: number; lng: number } | null
  viewerArea: string | null
}) {
  const session = await getUserSession()
  const [
    featuredRaw,
    trendingRaw,
    newRaw,
    rawOffers,
    nearbyRaw,
    flags,
    homeBanner,
    homeFeed,
    favoriteIds,
    recommendations,
  ] = await Promise.all([
    getFeaturedBusinesses(1000),
    getTrendingBusinesses(200),
    getNewBusinesses(1000),
    getActiveOffers(1000),
    isLoggedIn ? getNearbyBusinesses(viewerLocation ? undefined : viewerArea ?? undefined, 1000) : Promise.resolve([]),
    getFeatureFlags(),
    getActiveAdsForSlot('home_banner', 1),
    getActiveAdsForSlot('home_feed', 1),
    session ? getFavoriteIds(session.userId) : Promise.resolve(new Set<string>()),
    session
      ? getHomeRecommendations(session.userId, viewerArea)
      : Promise.resolve({ businesses: [], description: '' }),
  ])

  const offers = fairOrderOffers(rawOffers, 16)

  // Featured eligibility is independent of public trend/reputation ranking.
  // The client rotation sees the complete eligible set and never prioritizes pins/order.
  const featured = featuredRaw.filter((b) => b.is_featured)

  // Use the dedicated trend score (velocity, verified engagement diversity,
  // recency, evidence-based reputation, quality and response) rather than the
  // generic fair-order score or paid featured status.
  const trending = trendingRaw

  const now = Date.now()
  const newOnes = newRaw.filter((b) =>
    b.is_new_project && !!b.new_until && new Date(b.new_until).getTime() > now,
  )

  const nearby = viewerLocation
    ? nearbyRaw
        .map((business) => ({ business, km: business.location ? distanceKm(viewerLocation, business.location) : Number.POSITIVE_INFINITY }))
        .filter((item) => Number.isFinite(item.km) && item.km <= 5)
        .sort((a, b) => a.km - b.km)
        .map((item) => item.business)
    : viewerArea
      ? fairOrder(nearbyRaw, 'nearby', { area: viewerArea }, { topWindow: 12, maxPerType: 3 })
      : []


  return (
    <>
      {flags.featured_enabled && <FeaturedBento businesses={featured} />}
      {flags.nearby_enabled && (
        <div id="nearby">
          <NearbyGrid
            businesses={nearby}
            favoriteIds={favoriteIds}
            isLoggedIn={isLoggedIn}
            viewerLocation={viewerLocation}
            viewerArea={viewerArea}
          />
        </div>
      )}
      {homeBanner.length > 0 && (
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px' }}>
          <AdSlot ads={homeBanner} variant="banner" />
        </div>
      )}
      {flags.trends_enabled && trending.length >= 1 && (
        <div id="trending">
          <TrendingRow businesses={trending} favoriteIds={favoriteIds} viewerLocation={viewerLocation} />
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
          <NewRow businesses={newOnes} favoriteIds={favoriteIds} viewerLocation={viewerLocation} />
        </div>
      )}
      <div id="suggested">
        <SuggestedSection
          businesses={recommendations.businesses}
          description={recommendations.description}
          favoriteIds={favoriteIds}
          viewerLocation={viewerLocation}
        />
      </div>
    </>
  )
}
