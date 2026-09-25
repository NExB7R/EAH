import HomeHero from '@/components/home-hero'
import FeaturedBento from '@/components/featured-bento'
import {
  getFeaturedBusinesses,
  getTopBusinesses,
} from '@/lib/data'
import { dailyShuffle } from '@/lib/ranking'
import type { Business } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [featured, topTrust] = await Promise.all([
    getFeaturedBusinesses(15),
    getTopBusinesses(15),
  ])

  // دمج بدون تكرار
  const seen = new Set<string>()
  const all: Business[] = []
  for (const b of [...featured, ...topTrust]) {
    if (!seen.has(b.id)) {
      seen.add(b.id)
      all.push(b)
    }
    if (all.length >= 15) break
  }

  // shuffle على الـ server (ثابت في نفس اليوم → بدون hydration mismatch)
  const shuffled = dailyShuffle(all)

  return (
    <main>
      <HomeHero />
      <FeaturedBento businesses={shuffled} />
    </main>
  )
}
