import HomeHero from '@/components/home-hero'
import FeaturedBento from '@/components/featured-bento'
import {
  getFeaturedBusinesses,
  getTopBusinesses,
} from '@/lib/data'
import type { Business } from '@/lib/data'

// ═══════════════════════════════════════════════════════════
// EAH — Home Page
// ═══════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Featured — مميزين + top trust (fallback)
  const [featured, topTrust] = await Promise.all([
    getFeaturedBusinesses(15),
    getTopBusinesses(15),
  ])

  // دمج بدون تكرار — مميزين أولاً
  const seen = new Set<string>()
  const featuredList: Business[] = []

  for (const b of [...featured, ...topTrust]) {
    if (!seen.has(b.id)) {
      seen.add(b.id)
      featuredList.push(b)
    }
    if (featuredList.length >= 15) break
  }

  return (
    <main>
      <HomeHero />
      <FeaturedBento businesses={featuredList} />
    </main>
  )
}
