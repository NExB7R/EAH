import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'
import RecommendClient from '@/components/recommend-client'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'import { loadUserProfileTags, parseUserTags, applyPersonalization } from '@/lib/personalization'

import { generateMockStats } from '@/lib/mock-stats'

export const revalidate = 600
export const metadata = {
  title: 'نفسك في ايه؟ | EAH',
  description: 'قولنا نفسك في ايه واحنا نرشحلك المكان المناسب',
}

export default async function RecommendPage() {
  const businesses = await getPublishedBusinesses(50)
  const withStats = businesses.map((b) => ({
    ...b,
    ...generateMockStats({ slug: b.slug, name: b.name, featured: b.badge === 'مميز' }),
  }))
  const ranked = rankBusinesses(withStats, { includeFeaturedBoost: true })
  const userTags = await loadUserProfileTags()
  const userProfile = parseUserTags(userTags)
  const personalized = applyPersonalization(ranked, userProfile)
  const diversified = diversifyByCategory(ranked, 'type')

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
