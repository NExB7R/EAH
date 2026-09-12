import HomeHero from '@/components/home-hero'
import SectionSlider from '@/components/section-slider'
import BusinessCardV2 from '@/components/business-card-v2'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SidePanel from '@/components/side-panel'
import { demoBusinesses } from '@/lib/demo-data'

export default function Page() {
  const restaurants = demoBusinesses.filter((b) => b.type === 'restaurant')
  const pharmacies = demoBusinesses.filter((b) => b.type === 'pharmacy')
  const markets = demoBusinesses.filter((b) => b.type === 'supermarket')
  const delivery = demoBusinesses.filter((b) => b.type === 'delivery_office')

  // نكرر الديمو مؤقتاً لحد ما نجيب بيانات حقيقية
  const repeat = <T,>(arr: T[], times: number): T[] =>
    Array.from({ length: times }).flatMap(() => arr)

  const featured = repeat(restaurants, 2)
  const trending = repeat([...restaurants, ...pharmacies], 2)
  const offers = repeat([...restaurants, ...markets], 2)
  const fresh = repeat([...pharmacies, ...delivery, ...markets], 2)

  return (
    <>
      <FloatingCapsuleHeader />
      <SidePanel />

      <main style={{ paddingTop: '160px', paddingBottom: '0' }}>
        <HomeHero />

        <SectionSlider
          id="restaurants"
          title="المطاعم بتقول إيه؟"
          subtitle="أقرب الأكلات اللي على مزاجك"
          seeAllHref="/explore?type=restaurant"
          accent="purple"
        >
          {featured.map((b, i) => (
            <BusinessCardV2 key={`r-${i}`} business={b} />
          ))}
        </SectionSlider>

        <SectionSlider
          id="offers"
          title="عروض بتطير! 🔥"
          subtitle="وفّر أكتر مع العروض الحالية"
          seeAllHref="/offers"
          accent="gold"
        >
          {offers.map((b, i) => (
            <BusinessCardV2 key={`o-${i}`} business={b} />
          ))}
        </SectionSlider>

        <SectionSlider
          id="pharmacies"
          title="ناقصك من الصيدلية ايه؟"
          subtitle="صيدليات قريبة منك ومفتوحة"
          seeAllHref="/explore?type=pharmacy"
          accent="purple"
        >
          {fresh.map((b, i) => (
            <BusinessCardV2 key={`p-${i}`} business={b} />
          ))}
        </SectionSlider>

        <SectionSlider
          id="markets"
          title="الطيران بأيه؟ 🛵"
          subtitle="مكاتب توصيل بتغطي منطقتك"
          seeAllHref="/explore?type=delivery_office"
          accent="purple"
        >
          {repeat(delivery, 3).map((b, i) => (
            <BusinessCardV2 key={`d-${i}`} business={b} />
          ))}
        </SectionSlider>

        <SectionSlider
          id="trending"
          title="الترند دلوقتي 🔥"
          subtitle="الأماكن اللي الكل بيسأل عليها"
          seeAllHref="/trends"
          accent="gold"
        >
          {trending.map((b, i) => (
            <BusinessCardV2 key={`t-${i}`} business={b} />
          ))}
        </SectionSlider>
      </main>

      <SiteFooter />
    </>
  )
}
