import { Suspense } from 'react'
import HomeHero from '@/components/home-hero'
import FeaturedBento from '@/components/featured-bento'
import TrendingRow from '@/components/trending-row'
import OffersStrip from '@/components/offers-strip'
import NewRow from '@/components/new-row'
import NearbyGrid from '@/components/nearby-grid'
import SuggestedSection from '@/components/suggested-section'
import AdSlot from '@/components/ad-slot'
import ChipScrollHandler from '@/components/chip-scroll-handler'
import { getPublishedBusinesses, getActiveOffers } from '@/lib/data'
import { getFeatureFlags } from '@/lib/features'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness } from '@/lib/data/merchant'
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
      <Suspense fallback={null}>
        <HomeSections typeFilter={params.type} />
      </Suspense>
    </main>
  )
}

async function HomeSections({ typeFilter }: { typeFilter?: string }) {
  const [allRaw, rawOffers, flags, homeBanner, homeFeed] = await Promise.all([
    getPublishedBusinesses(),
    getActiveOffers(30),
    getFeatureFlags(),
    getActiveAdsForSlot('home_banner', 1),
    getActiveAdsForSlot('home_feed', 1),
  ])

  // ─── الفلترة ───
  let all = allRaw
  if (typeFilter === 'open') {
    all = all.filter((b) => isOpenNow(b.working_hours))
  } else if (typeFilter === 'online') {
    all = all.filter((b) => b.accepts_whatsapp_orders)
  } else if (typeFilter && typeFilter !== 'all') {
    all = all.filter((b) => b.business_type === typeFilter)
  }

  const offers = fairOrderOffers(rawOffers, 8)

  const featured = fairOrder(
    all.filter((b) => b.is_featured),
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
          <TrendingRow businesses={trending} />
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
          <NewRow businesses={newOnes} />
        </div>
      )}
      {flags.nearby_enabled && (
        <div id="nearby">
          <NearbyGrid businesses={nearby} />
        </div>
      )}
      <div id="suggested">
        <SuggestedSection />
      </div>
    </>
  )
}
