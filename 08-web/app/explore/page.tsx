import Link from 'next/link'
import ExploreClient from '@/components/explore-client'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import BackToTop from '@/components/back-to-top'
import EahLogo from '@/components/eah-logo'
import './explore-hero.css'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { generateMockStats } from '@/lib/mock-stats'

export const revalidate = 60

export const metadata = {
  title: 'اكتشف',
  description: 'اكتشف كل الأماكن في شبين القناطر — مطاعم، صيدليات، ماركت، توصيل',
}

const VALID_TYPES = ['restaurant', 'pharmacy', 'supermarket', 'delivery_office']

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; intent?: string }>
}) {
  const params = await searchParams
  const rawFilter = params.type ?? params.intent
  const activeType = rawFilter && VALID_TYPES.includes(rawFilter) ? rawFilter : undefined

  // ✅ نجيب كل الأماكن (مش بنفلتر في السيرفر — العميل بيفلتر)
  const businesses = await getPublishedBusinesses(80)

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

  const headline = activeType
    ? activeType === 'restaurant' ? 'المطاعم'
    : activeType === 'pharmacy' ? 'الصيدليات'
    : activeType === 'supermarket' ? 'الماركت'
    : 'التوصيل'
    : 'كل اللي حواليك'

  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <div className="explore-hero">
          <Link href="/" className="explore-hero__back">← الرئيسية</Link>
          <div className="explore-hero__logo">
            <EahLogo size="lg" variant="full" href="/" />
          </div>
          <div className="explore-hero__kicker">اكتشف</div>
          <h1 className="explore-hero__title">{headline}</h1>
          <p className="explore-hero__subtitle">
            {diversified.length} مكان — مرتبة بذكاء حسب الجودة والنشاط
          </p>
        </div>
        <ExploreClient businesses={diversified} initialType={activeType} />
      </main>
      <SiteFooter />
    </>
  )
}
