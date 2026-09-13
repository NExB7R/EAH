import Link from 'next/link'
import ExploreClient from '@/components/explore-client'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import BackToTop from '@/components/back-to-top'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { generateMockStats } from '@/lib/mock-stats'

export const revalidate = 300

const TYPE_MAP: Record<string, string> = {
  food: 'restaurant',
  pharmacy: 'pharmacy',
  groceries: 'supermarket',
  delivery: 'delivery_office',
  restaurant: 'restaurant',
  supermarket: 'supermarket',
  delivery_office: 'delivery_office',
}

export const metadata = {
  title: 'اكتشف | EAH',
  description: 'اكتشف كل الأماكن في شبين القناطر — مطاعم، صيدليات، سوبر ماركت، توصيل',
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>
}) {
  const params = await searchParams
  const intent = params.intent ? TYPE_MAP[params.intent] ?? params.intent : undefined

  const businesses = await getPublishedBusinesses(50, intent)

  // نحوّل لإحصائيات + نرتب ذكي
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
          <h1 className="explore-hero__title">
            {intent ? 'اختيارات مناسبة لطلبك' : 'كل اللي حواليك'}
          </h1>
          <p className="explore-hero__subtitle">
            {diversified.length} مكان في شبين القناطر — مرتبة بذكاء حسب الجودة والنشاط
          </p>
        </div>

        <ExploreClient businesses={diversified} />
      </main>

      <SiteFooter />
    </>
  )
}
