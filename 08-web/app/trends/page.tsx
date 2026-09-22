import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import EahLogo from '@/components/eah-logo'
import { IcRestaurant, IcPharmacy, IcMarket, IcDelivery } from '@/components/eah-icons'

const TYPE_ICON: Record<string, React.ComponentType> = {
  restaurant: IcRestaurant,
  pharmacy: IcPharmacy,
  delivery_office: IcDelivery,
}
import { createClient } from '@/lib/supabase-server'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { getViewStats } from '@/lib/real-stats'
import './trends.css'

export const revalidate = 120

export const metadata = {
  title: 'الترند النهاردة',
  description: 'أحدث الترند النهاردة في شبين القناطر — الأماكن الأكثر تفاعلاً وزيارات.',
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطاعم',
  pharmacy: 'صيدليات',
  delivery_office: 'توصيل',
}

export default async function TrendsPage() {
  const businesses = await getPublishedBusinesses(50)

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

  const ranked = rankBusinesses(withStats as any, { includeFeaturedBoost: true })
  const diversified = diversifyByCategory(ranked as any, 'type') as any[]
  const top3 = diversified.slice(0, 3)
  const rest = diversified.slice(3, 20)

  // Category groups
  const restaurants = diversified.filter((b) => b.type === 'restaurant').slice(0, 5)
  const pharmacies = diversified.filter((b) => b.type === 'pharmacy').slice(0, 5)
  const delivery = diversified.filter((b) => b.type === 'delivery_office').slice(0, 5)

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="tr">
        {/* Hero */}
        <section className="tr__hero">
          <div className="tr__hero-glow" aria-hidden />
          <div className="tr__logo">
            <EahLogo size="md" variant="full" href="/" />
          </div>
          <span className="tr__kicker e-badge e-badge--accent">الترند النهاردة</span>
          <h1 className="tr__title e-gradient">الترند النهاردة</h1>
          <p className="tr__sub e-page__sub">
            الأماكن الأكثر تفاعلاً وزيارات في آخر 7 أيام
          </p>
        </section>

        {/* Podium — Top 3 */}
        {top3.length >= 3 && (
          <section className="tr__podium" aria-label="الأكثر رواجاً">
            {/* Rank 2 */}
            <article className="tr__podium-item tr__podium-item--2">
              <span className="tr__podium-rank">2</span>
              <span className="tr__podium-emoji">{(() => { const I = TYPE_ICON[top3[1].type]; return I ? <I /> : null })()}</span>
              <h3 className="tr__podium-name">{top3[1].name}</h3>
              <p className="tr__podium-type">{TYPE_LABEL[top3[1].type] ?? top3[1].type}</p>
              <Link href={`/businesses/${top3[1].slug}`} className="tr__podium-link">
                شوفه ←
              </Link>
            </article>

            {/* Rank 1 */}
            <article className="tr__podium-item tr__podium-item--1">
              <span className="tr__podium-crown"></span>
              <span className="tr__podium-rank">1</span>
              <span className="tr__podium-emoji">{(() => { const I = TYPE_ICON[top3[0].type]; return I ? <I /> : null })()}</span>
              <h3 className="tr__podium-name">{top3[0].name}</h3>
              <p className="tr__podium-type">{TYPE_LABEL[top3[0].type] ?? top3[0].type}</p>
              <Link href={`/businesses/${top3[0].slug}`} className="tr__podium-link">
                شوفه ←
              </Link>
            </article>

            {/* Rank 3 */}
            <article className="tr__podium-item tr__podium-item--3">
              <span className="tr__podium-rank">3</span>
              <span className="tr__podium-emoji">{(() => { const I = TYPE_ICON[top3[2].type]; return I ? <I /> : null })()}</span>
              <h3 className="tr__podium-name">{top3[2].name}</h3>
              <p className="tr__podium-type">{TYPE_LABEL[top3[2].type] ?? top3[2].type}</p>
              <Link href={`/businesses/${top3[2].slug}`} className="tr__podium-link">
                شوفه ←
              </Link>
            </article>
          </section>
        )}

        {/* Trending list */}
        {rest.length > 0 && (
          <section className="tr__section">
            <header className="tr__section-head">
              <h2 className="tr__section-title">الترند الأسبوع</h2>
              <p className="tr__section-sub">أماكن بتاخد تفاعل متزايد</p>
            </header>
            <div className="tr__list">
              {rest.map((b, i) => (
                <Link
                  key={b.slug}
                  href={`/businesses/${b.slug}`}
                  className="tr__list-item"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span className="tr__list-rank">#{i + 4}</span>
                  <span className="tr__list-emoji">{(() => { const I = TYPE_ICON[b.type]; return I ? <I /> : null })()}</span>
                  <div className="tr__list-body">
                    <span className="tr__list-name">{b.name}</span>
                    <span className="tr__list-type">{TYPE_LABEL[b.type] ?? b.type}</span>
                  </div>
                  <span className="tr__list-arrow">←</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Per-category */}
        <div className="tr__categories">
          {[
            { label: 'ترند المطاعم', items: restaurants, href: '/explore?type=restaurant' },
            { label: 'ترند الصيدليات', items: pharmacies, href: '/explore?type=pharmacy' },
            { label: 'ترند التوصيل', items: delivery, href: '/explore?type=delivery_office' },
          ]
            .filter((c) => c.items.length > 0)
            .map((c) => (
              <section key={c.label} className="tr__cat">
                <header className="tr__cat-head">
                  <h3 className="tr__cat-title">{c.label}</h3>
                  <Link href={c.href} className="tr__cat-link">الكل ←</Link>
                </header>
                <div className="tr__cat-list">
                  {c.items.map((b) => (
                    <Link
                      key={b.slug}
                      href={`/businesses/${b.slug}`}
                      className="tr__cat-item"
                    >
                      <span className="tr__cat-name">{b.name}</span>
                      <span className="tr__cat-arrow">←</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
        </div>

        {/* Empty state */}
        {diversified.length === 0 && (
          <div className="tr__empty">
            <span className="tr__empty-emoji"></span>
            <h3>مفيش بيانات كفاية للترند دلوقتي</h3>
            <p>ارجعلنا قريب — الترند النهاردة بتتجدد كل يوم.</p>
            <Link href="/explore" className="tr__empty-btn">اكتشف الأماكن</Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
