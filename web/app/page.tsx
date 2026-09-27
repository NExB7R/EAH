import HomeHero from '@/components/home-hero'
import FeaturedBento from '@/components/featured-bento'
import TrendingList from '@/components/trending-list'
import OffersStrip from '@/components/offers-strip'
import NearbyGrid from '@/components/nearby-grid'
import NewGrid from '@/components/new-grid'
import {
  getFeaturedBusinesses,
  getTopBusinesses,
  getTrendingBusinesses,
  getActiveOffers,
  getNearbyBusinesses,
  getNewBusinesses,
} from '@/lib/data'
import { sortByTrend } from '@/lib/ranking'
import type { Business } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [featured, topTrust, trending, offers, nearby, newOnes] =
    await Promise.all([
      getFeaturedBusinesses(15),
      getTopBusinesses(15),
      getTrendingBusinesses(10),
      getActiveOffers(8),
      getNearbyBusinesses('شبين القناطر', 4),
      getNewBusinesses(6),
    ])

  const seen = new Set<string>()
  const all: Business[] = []
  for (const b of [...featured, ...topTrust]) {
    if (!seen.has(b.id)) {
      seen.add(b.id)
      all.push(b)
    }
    if (all.length >= 15) break
  }

  const trendList = sortByTrend(topTrust).slice(0, 10)

  return (
    <main>
      <HomeHero />
      <FeaturedBento businesses={all} />
      <TrendingList businesses={trending.length > 0 ? trending : trendList} />
      <OffersStrip offers={offers} />
      <NearbyGrid businesses={nearby} area="شبين القناطر" />
      <NewGrid businesses={newOnes} />
    </main>
  )
}
