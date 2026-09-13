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
import FloatingCapsuleHeader from '@/components/floating-capsule'
import BackToTop from '@/components/back-to-top'

export const revalidate = 120

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business) return { title: 'النشاط مش موجود' }
  return {
    title: `${business.name} | EAH`,
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
      </main>

      <SiteFooter />
    </>
  )
}
