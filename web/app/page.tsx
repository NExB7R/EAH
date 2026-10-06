import { Suspense } from 'react'
import HomeHero from '@/components/home-hero'
import FeaturedBento from '@/components/featured-bento'
import TrendingRow from '@/components/trending-row'
import OffersStrip from '@/components/offers-strip'
import NewRow from '@/components/new-row'
import NearbyGrid from '@/components/nearby-grid'
import SuggestedSection from '@/components/suggested-section'
import AdSlot from '@/components/ad-slot'
import { getPublishedBusinesses, getActiveOffers } from '@/lib/data'
import { getFeatureFlags } from '@/lib/features'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness } from '@/lib/data/merchant'
import { getActiveAdsForSlot } from '@/lib/data/ads'
import { sortByTrend } from '@/lib/ranking'
import type { Business } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getUserSession()
  const business = session ? await getMyBusiness(session.userId) : null

  return (
    <main>
      <HomeHero isLoggedIn={!!session} hasBusiness={!!business} />
      <Suspense fallback={null}>
        <HomeSections />
      </Suspense>
    </main>
  )
}

async function HomeSections() {
  const [all, offers, flags, homeBanner, homeFeed] = await Promise.all([
    getPublishedBusinesses(),
    getActiveOffers(8),
    getFeatureFlags(),
    getActiveAdsForSlot('home_banner', 1),
    getActiveAdsForSlot('home_feed', 1),
  ])

  const featured = all.filter((b) => b.is_featured).slice(0, 15)
  const topTrust = all.slice(0, 15)
  const newOnes = all.filter((b) => b.is_new_project).slice(0, 12)
  const nearby = all.filter((b) => b.area === 'شبين القناطر').slice(0, 12)
  const trending = sortByTrend(all).slice(0, 12)

  const seen = new Set<string>()
  const featuredMerged: Business[] = []
  for (const b of [...featured, ...topTrust]) {
    if (!seen.has(b.id)) {
      seen.add(b.id)
      featuredMerged.push(b)
    }
    if (featuredMerged.length >= 15) break
  }

  return (
    <>
      {flags.featured_enabled && <FeaturedBento businesses={featuredMerged} />}
      {homeBanner.length > 0 && (
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px' }}>
          <AdSlot ads={homeBanner} variant="banner" />
        </div>
      )}
      {flags.trends_enabled && <TrendingRow businesses={trending} />}
      {flags.offers_enabled && <OffersStrip offers={offers} />}
      {homeFeed.length > 0 && (
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px' }}>
          <AdSlot ads={homeFeed} variant="banner" />
        </div>
      )}
      {flags.new_enabled && <NewRow businesses={newOnes} />}
      {flags.nearby_enabled && <NearbyGrid businesses={nearby} />}
      <SuggestedSection />
    </>
  )
}
