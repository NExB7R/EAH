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

export const revalidate = 300

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

      <main style={{ paddingTop: '90px' }}>
        <HomeHero />
        <MobileTrending />

        {/* مطاعم — نمط "بطل أولاً" */}
        <SectionSlider
          id="restaurants"
          title="نفسك في إيه؟ 🔥"
          subtitle={`${restaurants.length} مطعم`}
          seeAllHref="/explore?type=restaurant"
          variant="restaurant"
          maxItems={12}
          totalItems={restaurants.length}
        >
          {restaurants.slice(0, 12).map((b, i) => (
            <ExploreCard key={b.slug} business={b} size={i === 0 ? 'hero' : 'md'} />
          ))}
        </SectionSlider>

        {/* عروض — نمط "كلها أبطال صغيرة" */}
        <SectionSlider
          id="offers"
          title="عروض نار 🔥"
          subtitle={`${offers.length} عرض شغال`}
          seeAllHref="/offers"
          variant="offer"
          maxItems={12}
          totalItems={offers.length}
        >
          {offers.slice(0, 12).map((b, i) => (
            <ExploreCard key={b.slug} business={b} size={i === 0 ? 'hero' : 'lg'} />
          ))}
        </SectionSlider>

        {/* صيدليات */}
        <SectionSlider
          id="pharmacies"
          title="صحتك أولاً 💊"
          subtitle={`${pharmacies.length} صيدلية`}
          seeAllHref="/explore?type=pharmacy"
          variant="pharmacy"
          maxItems={12}
          totalItems={pharmacies.length}
        >
          {pharmacies.slice(0, 12).map((b, i) => (
            <ExploreCard key={b.slug} business={b} size={i === 0 ? 'hero' : 'md'} />
          ))}
        </SectionSlider>

        {/* توصيل */}
        <SectionSlider
          id="delivery"
          title="على السريع 🛵"
          subtitle={`${delivery.length} مكتب توصيل`}
          seeAllHref="/explore?type=delivery_office"
          variant="delivery"
          maxItems={12}
          totalItems={delivery.length}
        >
          {delivery.slice(0, 12).map((b, i) => (
            <ExploreCard key={b.slug} business={b} size={i === 0 ? 'hero' : 'sm'} />
          ))}
        </SectionSlider>

        {/* جديد */}
        {newBiz.length > 0 && (
          <SectionSlider
            id="new-businesses"
            title="مشاريع صغيرة، فرص كبيرة 🌱"
            subtitle={`${newBiz.length} مكان جديد`}
            seeAllHref="/explore?type=new"
            variant="new"
            maxItems={12}
            totalItems={newBiz.length}
          >
            {newBiz.slice(0, 12).map((b, i) => (
              <ExploreCard key={b.slug} business={b} size={i === 0 ? 'hero' : 'lg'} />
            ))}
          </SectionSlider>
        )}
      </main>

      <SiteFooter />
    </>
  )
}
