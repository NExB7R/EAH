import { notFound } from 'next/navigation'
import { getBusinessBySlug } from '@/lib/data'
import {
  getBusinessStats,
  getBusinessReviews,
  getBusinessOffers,
  getBusinessContacts,
} from '@/lib/reviews'
import PageViewTracker from '@/components/page-view-tracker'
import BusinessHero from '@/components/business-hero'
import BusinessContact from '@/components/business-contact'
import BusinessReviews from '@/components/business-reviews'
import ReportButton from '@/components/report-button'
import ReviewForm from '@/components/review-form'
import BusinessOffers from '@/components/business-offers'
import SiteFooter from '@/components/site-footer'
import BusinessClaimCTA from '@/components/business-claim-cta'
import OrderRequest from '@/components/order-request'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import BackToTop from '@/components/back-to-top'

export const revalidate = 120

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business) return { title: 'النشاط مش موجود' }
  return {
    title: `${business.name}`,
    description: business.reason,
  }
}

const EMPTY_STATS = {
  business_id: '',
  avg_taste: 0,
  avg_value: 0,
  avg_speed: 0,
  avg_experience: 0,
  avg_rating: 0,
  total_reviews: 0,
  review_count: 0,
  active_offers: 0,
  recent_views: 0,
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business) notFound()

  // businessId ممكن يكون undefined لو رجعنا من demo fallback
  const hasId = !!business.businessId

  const [stats, reviews, offers, contacts] = await Promise.all([
    hasId ? getBusinessStats(business.businessId!) : Promise.resolve(EMPTY_STATS),
    hasId ? getBusinessReviews(business.businessId!, 6) : Promise.resolve([]),
    hasId ? getBusinessOffers(business.businessId!) : Promise.resolve([]),
    hasId ? getBusinessContacts(business.businessId!) : Promise.resolve([]),
  ])

  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      {hasId && <PageViewTracker businessId={business.businessId!} />}

      <main>
        <nav className="bc" aria-label="breadcrumbs">
          <a href="/" className="bc__link">الرئيسية</a>
          <span className="bc__sep">/</span>
          <a href="/explore" className="bc__link">اكتشف</a>
          <span className="bc__sep">/</span>
          <a
            href={`/explore?type=${business.type}`}
            className="bc__link"
          >
            {business.type === 'restaurant' ? 'مطاعم'
              : business.type === 'pharmacy' ? 'صيدليات'
              : business.type === 'supermarket' ? 'ماركت'
              : 'توصيل'}
          </a>
          <span className="bc__sep">/</span>
          <span className="bc__current">{business.name}</span>
        </nav>

        <BusinessHero
          business={{
            name: business.name,
            slug: business.slug,
            type: business.type,
            area: business.area,
            reason: business.reason,
            open: business.open,
            vibe: business.vibe,
          }}
          stats={{
            avg_rating: stats.avg_rating,
            review_count: stats.review_count,
            active_offers: stats.active_offers,
          }}
        />

        <BusinessOffers offers={offers} />

        {hasId && (
          <OrderRequest
            businessId={business.businessId!}
            businessName={business.name}
            merchantPhone={
              contacts.find((c) => c.method_type === 'whatsapp')?.value ??
              contacts.find((c) => c.method_type === 'phone')?.value ??
              null
            }
          />
        )}

        {hasId && <BusinessContact businessId={business.businessId!} contacts={contacts} />}

        {business.businessId && (
          <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 20px' }}>
            <ReviewForm businessId={business.businessId} />
          </div>
        )}

        <BusinessReviews stats={stats} reviews={reviews} />

        {business.businessId && (
          <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 20px', display: 'flex', justifyContent: 'flex-end' }}>
            <ReportButton entityType="business" entityId={business.businessId} />
          </div>
        )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            '@id': `https://eah-sq.vercel.app/businesses/${business.slug}#business`,
            name: business.name,
            description: business.reason,
            url: `https://eah-sq.vercel.app/businesses/${business.slug}`,
            image: `https://eah-sq.vercel.app/api/og?slug=${business.slug}`,
            areaServed: {
              '@type': 'City',
              name: business.area,
            },
            address: {
              '@type': 'PostalAddress',
              addressLocality: business.area,
              addressRegion: 'Qalyubia',
              addressCountry: 'EG',
            },
            ...(stats.review_count > 0 && stats.avg_rating > 0
              ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: stats.avg_rating.toFixed(1),
                    reviewCount: stats.review_count,
                    bestRating: 5,
                    worstRating: 1,
                  },
                }
              : {}),
            ...(contacts.length > 0
              ? {
                  contactPoint: contacts.slice(0, 3).map((c) => ({
                    '@type': 'ContactPoint',
                    contactType: c.method_type === 'phone' ? 'customer service' : c.method_type,
                    telephone: c.method_type === 'phone' ? c.value : undefined,
                    url: c.method_type !== 'phone' && c.method_type !== 'whatsapp' ? c.value : undefined,
                  })),
                }
              : {}),
          }),
        }}
      />
      </main>

      <BusinessClaimCTA businessName={typeof business?.name === 'string' ? business.name : undefined} />
      <SiteFooter />
    </>
  )
}
