import HomeHero from '@/components/home-hero'
import FeaturedBento from '@/components/featured-bento'
import TrendingList from '@/components/trending-list'
import OffersStrip from '@/components/offers-strip'
import {
  getFeaturedBusinesses,
  getTopBusinesses,
  getTrendingBusinesses,
  getActiveOffers,
} from '@/lib/data'
import { sortByTrend } from '@/lib/ranking'
import type { Business } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [featured, topTrust, trending, offers] = await Promise.all([
    getFeaturedBusinesses(15),
    getTopBusinesses(15),
    getTrendingBusinesses(10),
    getActiveOffers(8),
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
    <main data-snap="true">
      <HomeHero />
      <FeaturedBento businesses={all} />
      <TrendingList businesses={trending.length > 0 ? trending : trendList} />
      <OffersStrip offers={offers} />
    </main>
  )
}
