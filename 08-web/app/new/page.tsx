import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import EahLogo from '@/components/eah-logo'
import ExploreCard from '@/components/explore-card'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { getViewStats } from '@/lib/real-stats'
import './new.css'

export const revalidate = 120

export const metadata = {
  title: 'مشاريع محتاجة فرصة',
  description: 'أحدث الأماكن على EAH — مشاريع جديدة محتاجة فرصة.',
}

export default async function NewPage() {
  const businesses = await getPublishedBusinesses(80)
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
    lastShownAt: undefined,
    totalImpressions: 0,
  }))

  const ranked = rankBusinesses(withStats as any, { includeFeaturedBoost: false })
  const diversified = diversifyByCategory(ranked as any, 'type') as any[]
  const newOnes = diversified
    .filter((b) => (b as any).ageInDays !== undefined && (b as any).ageInDays < 30)
    .slice(0, 24)
  const list = newOnes.length > 0 ? newOnes : diversified.slice(0, 24)

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="nw">
        <section className="nw__hero">
          <div className="nw__hero-glow" aria-hidden />
          <div className="nw__logo">
            <EahLogo size="md" variant="full" href="/" />
          </div>
          <span className="nw__kicker nw-theme">بدايات جديدة</span>
          <h1 className="nw__title e-gradient">مشاريع محتاجة فرصة</h1>
          <p className="nw__sub e-page__sub">
            {list.length} مكان جديد — دعمهم يبدأ بزيارة
          </p>
        </section>

        {list.length === 0 ? (
          <div className="nw__empty">
            <span></span>
            <h3>مفيش أماكن جديدة دلوقتي</h3>
            <p>الأماكن الجديدة بتظهر أول بأول — ارجع قريب.</p>
            <Link href="/explore" className="nw__empty-btn">اكتشف الأماكن</Link>
          </div>
        ) : (
          <div className="nw__grid">
            {list.map((b) => (
              <ExploreCard key={b.slug} business={b} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
