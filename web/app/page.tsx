import HomeHero from '@/components/home-hero'
import FeaturedBento from '@/components/featured-bento'
import TrendingRow from '@/components/trending-row'
import OffersStrip from '@/components/offers-strip'
import NewRow from '@/components/new-row'
import NearbyGrid from '@/components/nearby-grid'
import SuggestedSection from '@/components/suggested-section'
import {
  getPublishedBusinesses,
  getActiveOffers,
} from '@/lib/data'
import { sortByTrend } from '@/lib/ranking'
import type { Business } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // query واحدة لكل الأنشطة + query للعروض = 2 بدل 6
  const [all, offers] = await Promise.all([
    getPublishedBusinesses(),
    getActiveOffers(8),
  ])

  // فلترة في الكود — صفر DB calls إضافية
  const featured = all.filter((b) => b.is_featured).slice(0, 15)
  const topTrust = all.slice(0, 15) // مرتب بـ trust_score من الـ query
  const newOnes = all.filter((b) => b.is_new_project).slice(0, 12)
  const nearby = all
    .filter((b) => b.area === 'شبين القناطر')
    .slice(0, 12)

  // trending — sort في الكود
  const trending = sortByTrend(all).slice(0, 12)

  // featured = featured + topTrust (لو featured قليل)
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
      <FeaturedBento businesses={featuredMerged} />
      <TrendingRow businesses={trending} />
      <OffersStrip offers={offers} />
      <NewRow businesses={newOnes} />
      <NearbyGrid businesses={nearby} />
      <SuggestedSection />
    </main>
  )
}
