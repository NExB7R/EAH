import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'
import RecommendClient from '@/components/recommend-client'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { loadUserProfileTags, parseUserTags, applyPersonalization } from '@/lib/personalization'
import { getViewStats } from '@/lib/real-stats'


export const revalidate = 600
export const metadata = {
  title: 'نفسك في ايه؟',
  description: 'قولنا نفسك في ايه واحنا نرشحلك المكان المناسب',
}

export default async function RecommendPage() {
  const businesses = await getPublishedBusinesses(50)
  const viewStats = await getViewStats(businesses.map((b) => b.slug), 7)
  const withStats = businesses.map((b) => ({
    ...b,
    id: b.businessId ?? b.slug,
    recentViews: viewStats.get(b.slug)?.views ?? 0,
    rating: b.rating ?? 0,
    avg_rating: b.rating ?? 0,
    reviewCount: b.reviewCount ?? 0,
    recentComments: b.recentComments ?? 0,
    activeOffers: b.activeOffers ?? 0,
    ageInDays: b.ageInDays ?? 0,
    isFeatured: b.featured ?? false,
    lastShownAt: undefined,
    totalImpressions: 0,
  }))
  const ranked = rankBusinesses(withStats as any, { includeFeaturedBoost: true })
  const userTags = await loadUserProfileTags()
  const userProfile = parseUserTags(userTags)
  const personalized = applyPersonalization(ranked as any, userProfile) as any
  const diversified = diversifyByCategory(personalized as any, 'type') as any[]

  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <main style={{ minHeight: '100vh' }}>
        <RecommendClient businesses={diversified} />
      </main>
      <SiteFooter />
    </>
  )
}
