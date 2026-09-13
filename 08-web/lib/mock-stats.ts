/**
 * إحصائيات تجريبية — تُستخدم لحد ما نربط Supabase.
 * كل مكان ياخد إحصائيات شبه واقعية.
 */

import type { RankingStats } from './ranking'

/** hash بسيط لاسم المكان عشان نولّد إحصائيات ثابتة */
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function generateMockStats(business: {
  slug: string
  name: string
  featured?: boolean
}): RankingStats {
  const h = hash(business.slug)

  // توزيع واقعي: بعض الأماكن قوية، بعضها متوسط، بعضها جديد
  const tier = h % 10  // 0-9

  let rating: number
  let reviewCount: number
  let recentViews: number
  let recentComments: number
  let activeOffers: number
  let ageInDays: number

  if (tier < 2) {
    // نخبة (20%)
    rating = 4.6 + (h % 40) / 100
    reviewCount = 50 + (h % 200)
    recentViews = 800 + (h % 2000)
    recentComments = 10 + (h % 40)
    activeOffers = 1 + (h % 3)
    ageInDays = 90 + (h % 500)
  } else if (tier < 6) {
    // نجوم صاعدة (40%)
    rating = 4.0 + (h % 50) / 100
    reviewCount = 15 + (h % 80)
    recentViews = 200 + (h % 600)
    recentComments = 3 + (h % 15)
    activeOffers = (h % 2)
    ageInDays = 30 + (h % 300)
  } else if (tier < 8) {
    // جديدة (20%)
    rating = 4.2 + (h % 30) / 100
    reviewCount = 2 + (h % 20)
    recentViews = 50 + (h % 300)
    recentComments = 0 + (h % 5)
    activeOffers = 0
    ageInDays = 2 + (h % 25)
  } else {
    // متوسطة (20%)
    rating = 3.6 + (h % 60) / 100
    reviewCount = 5 + (h % 40)
    recentViews = 100 + (h % 300)
    recentComments = 1 + (h % 8)
    activeOffers = 0
    ageInDays = 60 + (h % 400)
  }

  return {
    id: business.slug,
    slug: business.slug,
    rating: Math.round(rating * 10) / 10,
    reviewCount,
    recentViews,
    recentComments,
    activeOffers,
    ageInDays,
    isFeatured: business.featured ?? false,
    lastShownAt: undefined,
    totalImpressions: 0,
  }
}
