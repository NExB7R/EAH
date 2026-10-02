import HomeHero from '@/components/home-hero'
import FeaturedBento from '@/components/featured-bento'
import TrendingRow from '@/components/trending-row'
import OffersStrip from '@/components/offers-strip'
import NewRow from '@/components/new-row'
import NearbyGrid from '@/components/nearby-grid'
import SuggestedSection from '@/components/suggested-section'
import { getPublishedBusinesses, getActiveOffers } from '@/lib/data'
import { getFeatureFlags } from '@/lib/features'
import { sortByTrend } from '@/lib/ranking'
import type { Business } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [all, offers, flags] = await Promise.all([
    getPublishedBusinesses(),
    getActiveOffers(8),
    getFeatureFlags(),
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
    <main>
      <HomeHero />
      {flags.featured_enabled && <FeaturedBento businesses={featuredMerged} />}
      {flags.trends_enabled && <TrendingRow businesses={trending} />}
      {flags.offers_enabled && <OffersStrip offers={offers} />}
      {flags.new_enabled && <NewRow businesses={newOnes} />}
      {flags.nearby_enabled && <NearbyGrid businesses={nearby} />}
      <SuggestedSection />
    </main>
  )
}
