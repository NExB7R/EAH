import { Suspense } from 'react'
import Link from 'next/link'
import ExploreClient from '@/components/explore-client'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import BackToTop from '@/components/back-to-top'
import EahLogo from '@/components/eah-logo'
import SearchBar from '@/components/search/search-bar'
import './explore-hero.css'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { getViewStats } from '@/lib/real-stats'
import { getPrimaryLocation } from '@/lib/locations'
import { FOOD_CATEGORIES } from '@/lib/food/categories'

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

  const businesses = await getPublishedBusinesses(80)

  const primaryLoc = await getPrimaryLocation().catch(() => null)
  const clientCoords = primaryLoc ? { lat: primaryLoc.latitude, lng: primaryLoc.longitude } : null

  const viewStats = await getViewStats(businesses.map((b) => b.slug), 7)
  const withStats = businesses.map((b) => ({
    ...b,
    id: b.businessId ?? b.slug,
    recentViews: viewStats.get(b.slug)?.views ?? 0,
    rating: b.rating ?? 0,
    avg_rating: b.rating ?? 0,
    reviewCount: b.reviewCount ?? 0,
    recentComments: b.recentComments ?? 0,
    activeOffers: b.activeOffers ?? 0,
    ageInDays: b.ageInDays ?? 0,
    isFeatured: b.featured ?? false,
    food_categories: b.food_categories ?? [],
    lastShownAt: undefined,
    totalImpressions: 0,
  }))

  // احسب تصنيفات الأكل المتاحة من البيانات الخام (قبل أي ranking)
  const usedCats = new Set<string>()
  businesses.forEach((b) => {
    if (Array.isArray(b.food_categories)) {
      b.food_categories.forEach((c: string) => usedCats.add(c))
    }
  })
  // نعرض كل التصنيفات دايماً
  const availableFoodCats = FOOD_CATEGORIES

  const ranked = rankBusinesses(withStats as any, { includeFeaturedBoost: true })
  const diversified = diversifyByCategory(ranked as any, 'type') as any[]

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
      <main style={{ minHeight: '100vh' }}>
        <div className="explore-hero">
          <Link href="/" className="explore-hero__back">← الرئيسية</Link>
          <div className="explore-hero__logo">
            <EahLogo size="lg" variant="full" href="/" />
          </div>
          <div className="explore-hero__kicker">اكتشف</div>
          <h1 className="explore-hero__title e-gradient">{headline}</h1>
          <p className="explore-hero__subtitle">
            {diversified.length} مكان — مرتبة بذكاء حسب الجودة والنشاط
          </p>
        </div>
        <div className="explore-search-wrap"><SearchBar /></div>
        <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#A29DB5' }}>جاري التحميل...</div>}>
          <ExploreClient businesses={diversified} initialType={activeType} clientCoords={clientCoords} availableFoodCats={availableFoodCats} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}
