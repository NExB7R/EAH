import HomeHero from '@/components/home-hero'
import SectionSlider from '@/components/section-slider'
import BusinessCardV3 from '@/components/business-card-v3'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SidePanel from '@/components/side-panel'
import BackToTop from '@/components/back-to-top'
import { demoBusinesses } from '@/lib/demo-data'
import { fairOrder, getDailySeed } from '@/lib/fair-shuffle'

export default function Page() {
  const seed = getDailySeed()

  const restaurants = demoBusinesses.filter((b) => b.type === 'restaurant')
  const pharmacies = demoBusinesses.filter((b) => b.type === 'pharmacy')
  const markets = demoBusinesses.filter((b) => b.type === 'supermarket')
  const delivery = demoBusinesses.filter((b) => b.type === 'delivery_office')

  const restaurantsOrdered = fairOrder([...restaurants, ...restaurants, ...restaurants], seed + 1)
  const offersOrdered = fairOrder([...restaurants, ...markets, ...restaurants], seed + 2)
  const pharmaciesOrdered = fairOrder([...pharmacies, ...pharmacies, ...pharmacies], seed + 3)
  const deliveryOrdered = fairOrder([...delivery, ...delivery, ...delivery], seed + 4)
  const marketsOrdered = fairOrder([...markets, ...markets, ...markets], seed + 5)
  const newOrdered = fairOrder([...restaurants, ...pharmacies], seed + 6)

  return (
    <>
      <FloatingCapsuleHeader />
      <SidePanel />
      <BackToTop />

      <main style={{ paddingTop: '120px' }}>
        <HomeHero />

        <SectionSlider
          id="restaurants"
          title="نفسك في إيه؟ 🔥"
          subtitle="أقرب حاجة على مزاجك دلوقتي"
          seeAllHref="/explore?type=restaurant"
          variant="restaurant"
          maxItems={10}
          totalItems={restaurantsOrdered.length}
        >
          {restaurantsOrdered.slice(0, 10).map((b, i) => (
            <BusinessCardV3 key={`r-${i}-${b.slug}`} business={b} variant="restaurant" />
          ))}
        </SectionSlider>

        <SectionSlider
          id="offers"
          title="عروض نار 🔥"
          subtitle="وفّر أكتر مع العروض اللي شغالة"
          seeAllHref="/offers"
          variant="offer"
          maxItems={10}
          totalItems={offersOrdered.length}
        >
          {offersOrdered.slice(0, 10).map((b, i) => (
            <BusinessCardV3 key={`o-${i}-${b.slug}`} business={b} variant="offer" />
          ))}
        </SectionSlider>

        <SectionSlider
          id="pharmacies"
          title="صحتك أولاً 💊"
          subtitle="صيدليات قريبة منك ومفتوحة"
          seeAllHref="/explore?type=pharmacy"
          variant="pharmacy"
          maxItems={10}
          totalItems={pharmaciesOrdered.length}
        >
          {pharmaciesOrdered.slice(0, 10).map((b, i) => (
            <BusinessCardV3 key={`p-${i}-${b.slug}`} business={b} variant="pharmacy" />
          ))}
        </SectionSlider>

        <SectionSlider
          id="delivery"
          title="على السريع 🛵"
          subtitle="مكاتب توصيل بتغطي منطقتك"
          seeAllHref="/explore?type=delivery_office"
          variant="delivery"
          maxItems={10}
          totalItems={deliveryOrdered.length}
        >
          {deliveryOrdered.slice(0, 10).map((b, i) => (
            <BusinessCardV3 key={`d-${i}-${b.slug}`} business={b} variant="delivery" />
          ))}
        </SectionSlider>

        <SectionSlider
          id="markets"
          title="طلباتك عندنا 🛒"
          subtitle="مقاضي سريعة وقريبة منك"
          seeAllHref="/explore?type=supermarket"
          variant="market"
          maxItems={10}
          totalItems={marketsOrdered.length}
        >
          {marketsOrdered.slice(0, 10).map((b, i) => (
            <BusinessCardV3 key={`m-${i}-${b.slug}`} business={b} variant="market" />
          ))}
        </SectionSlider>

        <SectionSlider
          id="new-businesses"
          title="مشاريع صغيرة، فرص كبيرة 🌱"
          subtitle="ادعم متاجر جيرانك الجديدة"
          seeAllHref="/new"
          variant="new"
          maxItems={10}
          totalItems={newOrdered.length}
        >
          {newOrdered.slice(0, 10).map((b, i) => (
            <BusinessCardV3 key={`n-${i}-${b.slug}`} business={b} variant="new" />
          ))}
        </SectionSlider>
      </main>

      <SiteFooter />
    </>
  )
}
