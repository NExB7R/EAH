import HomeHero from '@/components/home-hero'
import CircleSlider from '@/components/circle-slider'
import SectionSlider from '@/components/section-slider'
import BusinessCardV4 from '@/components/business-card-v4'
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

  const offers = diversified
    .filter((b) => b.activeOffers > 0)
    .sort((a, b) => b.activeOffers - a.activeOffers || b.score - a.score)

  const newBiz = diversified
    .filter((b) => b.ageInDays < 30)
    .sort((a, b) => a.ageInDays - b.ageInDays)

  return (
    <>
      <FloatingCapsuleHeader />
      <SidePanel />
      <BackToTop />

      <main style={{ paddingTop: '100px' }}>
        <HomeHero />

        {/* ===== مطاعم — شكل بيتزا ===== */}
        <CircleSlider
          id="restaurants"
          title="نفسك في إيه؟ 🔥"
          subtitle={`${restaurants.length} مطعم مستنيينك`}
          seeAllHref="/explore?type=restaurant"
          shape="pizza"
          accent="#FB923C"
          maxVisible={8}
        >
          {restaurants.slice(0, 8).map((b) => (
            <BusinessCardV4 key={b.slug} business={b} variant="restaurant" />
          ))}
        </CircleSlider>

        {/* ===== عروض — أفقي عادي ===== */}
        <SectionSlider
          id="offers"
          title="عروض نار 🔥"
          subtitle={`${offers.length} عرض شغال دلوقتي`}
          seeAllHref="/offers"
          variant="offer"
          maxItems={10}
          totalItems={offers.length}
        >
          {offers.slice(0, 10).map((b) => (
            <BusinessCardV4 key={b.slug} business={b} variant="offer" />
          ))}
        </SectionSlider>

        {/* ===== صيدليات — شكل كبسولة ===== */}
        <CircleSlider
          id="pharmacies"
          title="صحتك أولاً 💊"
          subtitle={`${pharmacies.length} صيدلية قريبة`}
          seeAllHref="/explore?type=pharmacy"
          shape="capsule"
          accent="#4ADE80"
          maxVisible={6}
        >
          {pharmacies.slice(0, 6).map((b) => (
            <BusinessCardV4 key={b.slug} business={b} variant="pharmacy" />
          ))}
        </CircleSlider>

        {/* ===== توصيل — شكل صاعقة ===== */}
        <CircleSlider
          id="delivery"
          title="على السريع 🛵"
          subtitle={`${delivery.length} مكتب توصيل`}
          seeAllHref="/explore?type=delivery_office"
          shape="lightning"
          accent="#FB923C"
          maxVisible={5}
        >
          {delivery.slice(0, 5).map((b) => (
            <BusinessCardV4 key={b.slug} business={b} variant="delivery" />
          ))}
        </CircleSlider>

        {/* ===== جديد — شكل شتلة ===== */}
        {newBiz.length > 0 && (
          <CircleSlider
            id="new-businesses"
            title="مشاريع صغيرة، فرص كبيرة 🌱"
            subtitle={`${newBiz.length} مكان جديد`}
            seeAllHref="/explore?type=new"
            shape="seedling"
            accent="#C084FC"
            maxVisible={6}
          >
            {newBiz.slice(0, 6).map((b) => (
              <BusinessCardV4 key={b.slug} business={b} variant="new" />
            ))}
          </CircleSlider>
        )}
      </main>

      <SiteFooter />
    </>
  )
}
