import Link from 'next/link'
import ExploreClient from '@/components/explore-client'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import BackToTop from '@/components/back-to-top'
import SearchBar from '@/components/search-bar'
import './explore-hero.css'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { generateMockStats } from '@/lib/mock-stats'

export const revalidate = 60

const VALID_TYPES = ['restaurant', 'pharmacy', 'supermarket', 'delivery_office']

export const metadata = {
  title: 'اكتشف',
  description: 'اكتشف كل الأماكن في شبين القناطر — مطاعم، صيدليات، توصيل',
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; intent?: string }>
}) {
  const params = await searchParams
  const rawFilter = params.type ?? params.intent
  const activeType = rawFilter && VALID_TYPES.includes(rawFilter) ? rawFilter : undefined

  const businesses = await getPublishedBusinesses(50, activeType)

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
    ? activeType === 'restaurant'
      ? 'المطاعم'
      : activeType === 'pharmacy'
      ? 'الصيدليات'
      : activeType === 'supermarket'
      ? 'الماركت'
      : 'التوصيل'
    : 'كل اللي حواليك'

  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />

      <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
        <div className="explore-hero">
          <Link href="/" className="explore-hero__back">
            ← الرئيسية
          </Link>
          <div className="explore-hero__kicker">اكتشف</div>
          <h1 className="explore-hero__title">{headline}</h1>
          <p className="explore-hero__subtitle">
            {diversified.length} مكان — مرتبة بذكاء حسب الجودة والنشاط
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
            <SearchBar placeholder="ابحث في الأماكن..." />
          </div>
        </div>

        <ExploreClient
          businesses={diversified}
          initialType={activeType}
        />
      </main>

      <SiteFooter />
    </>
  )
}
