import HomeHero from '@/components/home-hero'
import FeaturedBento from '@/components/featured-bento'
import {
  getFeaturedBusinesses,
  getTopBusinesses,
} from '@/lib/data'

import type { Business } from '@/lib/data'

// ═══════════════════════════════════════════════════════════
// EAH — Home
// ═══════════════════════════════════════════════════════════
//
// ملاحظة (2026-09-27):
//   شلنا dailyShuffle من المميزين — كان بيكسر العدالة.
//   الآن: دوران عادل (Round-Robin) جوه FeaturedBento.
//   راجع LESSONS.md §13.
// ═══════════════════════════════════════════════════════════

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


  return (
    <main data-snap="true">
      <HomeHero />
      <FeaturedBento businesses={all} />
    </main>
  )
}
