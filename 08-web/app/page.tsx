import HomeHero from '@/components/home-hero'
import SectionSlider from '@/components/section-slider'
import BusinessCardV2 from '@/components/business-card-v2'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SidePanel from '@/components/side-panel'
import BackToTop from '@/components/back-to-top'
import { demoBusinesses } from '@/lib/demo-data'

export default function Page() {
  const restaurants = demoBusinesses.filter((b) => b.type === 'restaurant')
  const pharmacies = demoBusinesses.filter((b) => b.type === 'pharmacy')
  const markets = demoBusinesses.filter((b) => b.type === 'supermarket')
  const delivery = demoBusinesses.filter((b) => b.type === 'delivery_office')

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
          accent="purple"
        >
          {[...restaurants, ...restaurants].map((b, i) => (
            <BusinessCardV2 key={`r-${i}-${b.slug}`} business={b} />
          ))}
        </SectionSlider>

        <SectionSlider
          id="offers"
          title="عروض نار 🔥"
          subtitle="وفّر أكتر مع العروض اللي شغالة"
          seeAllHref="/offers"
          accent="gold"
        >
          {[...restaurants, ...markets, ...restaurants].map((b, i) => (
            <BusinessCardV2 key={`o-${i}-${b.slug}`} business={b} />
          ))}
        </SectionSlider>

        <SectionSlider
          id="pharmacies"
          title="صحتك أولاً 💊"
          subtitle="صيدليات قريبة منك ومفتوحة"
          seeAllHref="/explore?type=pharmacy"
          accent="purple"
        >
          {[...pharmacies, ...pharmacies, ...pharmacies].map((b, i) => (
            <BusinessCardV2 key={`p-${i}-${b.slug}`} business={b} />
          ))}
        </SectionSlider>

        <SectionSlider
          id="delivery"
          title="على السريع 🛵"
          subtitle="مكاتب توصيل بتغطي منطقتك"
          seeAllHref="/explore?type=delivery_office"
          accent="purple"
        >
          {[...delivery, ...delivery, ...delivery].map((b, i) => (
            <BusinessCardV2 key={`d-${i}-${b.slug}`} business={b} />
          ))}
        </SectionSlider>

        <SectionSlider
          id="markets"
          title="طلباتك عندنا 🛒"
          subtitle="مقاضي سريعة وقريبة منك"
          seeAllHref="/explore?type=supermarket"
          accent="purple"
        >
          {[...markets, ...markets, ...markets].map((b, i) => (
            <BusinessCardV2 key={`m-${i}-${b.slug}`} business={b} />
          ))}
        </SectionSlider>

        <SectionSlider
          id="new-businesses"
          title="مشاريع صغيرة، فرص كبيرة 🌱"
          subtitle="ادعم متاجر جيرانك الجديدة"
          seeAllHref="/new"
          accent="gold"
        >
          {[...restaurants, ...pharmacies].map((b, i) => (
            <BusinessCardV2 key={`n-${i}-${b.slug}`} business={b} />
          ))}
        </SectionSlider>
      </main>

      <SiteFooter />
    </>
  )
}
