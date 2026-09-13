import HomeHero from '@/components/home-hero'
import SectionSlider from '@/components/section-slider'
import BusinessCardV4 from '@/components/business-card-v4'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SidePanel from '@/components/side-panel'
import BackToTop from '@/components/back-to-top'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { generateMockStats } from '@/lib/mock-stats'

export const revalidate = 300 // إعادة تحميل كل 5 دقايق

export default async function Page() {
  // ===== قراءة من Supabase =====
  const businesses = await getPublishedBusinesses(50)

  // ===== نحوّل لإحصائيات + نرتب =====
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
  const markets = diversified.filter((b) => b.type === 'supermarket')
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

      <main style={{ paddingTop: '120px' }}>
        <HomeHero />

        <SectionSlider
          id="restaurants"
          title="نفسك في إيه؟ 🔥"
          subtitle={`${restaurants.length} مطعم في شبين القناطر`}
          seeAllHref="/explore?type=restaurant"
          variant="restaurant"
          maxItems={10}
          totalItems={restaurants.length}
        >
          {restaurants.slice(0, 10).map((b) => (
            <BusinessCardV4 key={b.slug} business={b} variant="restaurant" />
          ))}
        </SectionSlider>

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

        <SectionSlider
          id="pharmacies"
          title="صحتك أولاً 💊"
          subtitle={`${pharmacies.length} صيدلية قريبة منك`}
          seeAllHref="/explore?type=pharmacy"
          variant="pharmacy"
          maxItems={10}
          totalItems={pharmacies.length}
        >
          {pharmacies.slice(0, 10).map((b) => (
            <BusinessCardV4 key={b.slug} business={b} variant="pharmacy" />
          ))}
        </SectionSlider>

        <SectionSlider
          id="delivery"
          title="على السريع 🛵"
          subtitle={`${delivery.length} مكتب توصيل`}
          seeAllHref="/explore?type=delivery_office"
          variant="delivery"
          maxItems={10}
          totalItems={delivery.length}
        >
          {delivery.slice(0, 10).map((b) => (
            <BusinessCardV4 key={b.slug} business={b} variant="delivery" />
          ))}
        </SectionSlider>

        <SectionSlider
          id="markets"
          title="طلباتك عندنا 🛒"
          subtitle={`${markets.length} سوبر ماركت`}
          seeAllHref="/explore?type=supermarket"
          variant="market"
          maxItems={10}
          totalItems={markets.length}
        >
          {markets.slice(0, 10).map((b) => (
            <BusinessCardV4 key={b.slug} business={b} variant="market" />
          ))}
        </SectionSlider>

        {newBiz.length > 0 && (
          <SectionSlider
            id="new-businesses"
            title="مشاريع صغيرة، فرص كبيرة 🌱"
            subtitle={`${newBiz.length} مكان جديد`}
            seeAllHref="/new"
            variant="new"
            maxItems={10}
            totalItems={newBiz.length}
          >
            {newBiz.slice(0, 10).map((b) => (
              <BusinessCardV4 key={b.slug} business={b} variant="new" />
            ))}
          </SectionSlider>
        )}
      </main>

      <SiteFooter />
    </>
  )
}
