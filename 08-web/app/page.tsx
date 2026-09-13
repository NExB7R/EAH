import HomeHero from '@/components/home-hero'
import SectionSlider from '@/components/section-slider'
import ExploreCard from '@/components/explore-card'
import MobileTrending from '@/components/mobile-trending'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SidePanel from '@/components/side-panel'
import BackToTop from '@/components/back-to-top'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { generateMockStats } from '@/lib/mock-stats'

export const revalidate = 600

export default async function Page() {
  const businesses = await getPublishedBusinesses(50)

  const withStats = businesses.map((b) => {
    const stats = generateMockStats({
      slug: b.slug,
      name: b.name,
      featured: b.badge === 'مميز',
    })
    return { ...b, ...stats }
  })

  const ranked = rankBusinesses(withStats, { includeFeaturedBoost: true })
  const diversified = diversifyByCategory(ranked, 'type')

  const restaurants = diversified.filter((b) => b.type === 'restaurant')
  const pharmacies = diversified.filter((b) => b.type === 'pharmacy')
  const delivery = diversified.filter((b) => b.type === 'delivery_office')
  const offers = diversified.filter((b) => b.activeOffers > 0).sort((a, b) => b.activeOffers - a.activeOffers)
  const newBiz = diversified.filter((b) => b.ageInDays < 30)

  return (
    <>
      <FloatingCapsuleHeader />
      <SidePanel />
      <BackToTop />

      <main style={{ paddingTop: '80px' }}>
        <HomeHero />
        <MobileTrending />

        <SectionSlider
          id="restaurants"
          title="نفسك في إيه؟ 🔥"
          subtitle={`${restaurants.length} مطعم`}
          seeAllHref="/explore?type=restaurant"
          variant="restaurant"
          maxItems={8}
          totalItems={restaurants.length}
        >
          {restaurants.slice(0, 8).map((b) => (
            <ExploreCard key={b.slug} business={b} size="lg" />
          ))}
        </SectionSlider>

        <SectionSlider
          id="offers"
          title="عروض نار 🔥"
          subtitle={`${offers.length} عرض`}
          seeAllHref="/offers"
          variant="offer"
          maxItems={8}
          totalItems={offers.length}
        >
          {offers.slice(0, 8).map((b) => (
            <ExploreCard key={b.slug} business={b} size="lg" />
          ))}
        </SectionSlider>

        <SectionSlider
          id="pharmacies"
          title="صحتك أولاً 💊"
          subtitle={`${pharmacies.length} صيدلية`}
          seeAllHref="/explore?type=pharmacy"
          variant="pharmacy"
          maxItems={8}
          totalItems={pharmacies.length}
        >
          {pharmacies.slice(0, 8).map((b) => (
            <ExploreCard key={b.slug} business={b} size="lg" />
          ))}
        </SectionSlider>

        <SectionSlider
          id="delivery"
          title="على السريع 🛵"
          subtitle={`${delivery.length} مكتب`}
          seeAllHref="/explore?type=delivery_office"
          variant="delivery"
          maxItems={8}
          totalItems={delivery.length}
        >
          {delivery.slice(0, 8).map((b) => (
            <ExploreCard key={b.slug} business={b} size="lg" />
          ))}
        </SectionSlider>

        {newBiz.length > 0 && (
          <SectionSlider
            id="new-businesses"
            title="مشاريع صغيرة، فرص كبيرة 🌱"
            subtitle={`${newBiz.length} مكان جديد`}
            seeAllHref="/explore?type=new"
            variant="new"
            maxItems={8}
            totalItems={newBiz.length}
          >
            {newBiz.slice(0, 8).map((b) => (
              <ExploreCard key={b.slug} business={b} size="lg" />
            ))}
          </SectionSlider>
        )}
      </main>

      <SiteFooter />
    </>
  )
}
