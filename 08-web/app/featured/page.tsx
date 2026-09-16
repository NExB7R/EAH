import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'
import EahLogo from '@/components/eah-logo'
import ExploreCard from '@/components/explore-card'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { generateMockStats } from '@/lib/mock-stats'
import './featured.css'

export const revalidate = 120

export const metadata = {
  title: 'المميزون',
  description: 'أماكن مميزة على EAH — اختيارات مختارة بعناية.',
}

export default async function FeaturedPage() {
  const businesses = await getPublishedBusinesses(80)
  const withStats = businesses.map((b) => ({
    ...b,
    ...generateMockStats({
      slug: b.slug,
      name: b.name,
      featured: b.badge === 'مميز',
    }),
  }))

  const ranked = rankBusinesses(withStats, { includeFeaturedBoost: true })
  const diversified = diversifyByCategory(ranked, 'type')
  const featured = diversified.filter((b) => b.badge === 'مميز')
  const premium = diversified.filter((b) => (b as any).is_premium)

  const list = featured.length > 0 ? featured : premium.length > 0 ? premium : diversified.slice(0, 12)

  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <main className="feat">
        <section className="feat__hero">
          <div className="feat__hero-glow" aria-hidden />
          <div className="feat__logo">
            <EahLogo size="md" variant="full" href="/" />
          </div>
          <span className="feat__kicker">المميزين</span>
          <h1 className="feat__title">⭐ المميزون</h1>
          <p className="feat__sub">
            {list.length} مكان مميز على EAH — اختيارات مختارة بعناية
          </p>
        </section>

        {list.length === 0 ? (
          <div className="feat__empty">
            <span>⭐</span>
            <h3>مفيش أماكن مميزة دلوقتي</h3>
            <p>الأماكن المميزة بتتجدد باستمرار — ارجع قريب.</p>
            <Link href="/explore" className="feat__empty-btn">اكتشف الأماكن</Link>
          </div>
        ) : (
          <div className="feat__grid">
            {list.map((b) => (
              <ExploreCard key={b.slug} business={b} />
            ))}
          </div>
        )}
      
        <section className="feat__invite">
          <div className="feat__invite-inner">
            <span className="feat__invite-emoji" aria-hidden>👑</span>
            <h3 className="feat__invite-title">نشاطك يستاهل يبقى هنا</h3>
            <p className="feat__invite-body">
              المميزين على EAH اختارهم الفريق بعناية — وعشان مكانك يبقى واحد منهم، محتاج بس تبدأ.
            </p>
            <div className="feat__invite-actions">
              <a href="/merchant-info" className="feat__invite-btn">
                اعرف أكتر عن الباقات ←
              </a>
              <a href="/merchant/apply" className="feat__invite-btn feat__invite-btn--ghost">
                سجّل نشاطك
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
