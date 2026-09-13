import Link from 'next/link'
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

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business || !business.businessId) notFound()

  const [stats, reviews, offers, contacts] = await Promise.all([
    getBusinessStats(business.businessId),
    getBusinessReviews(business.businessId, 6),
    getBusinessOffers(business.businessId),
    getBusinessContacts(business.businessId),
  ])

  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <PageViewTracker businessId={business.businessId} />

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

        <BusinessContact businessId={business.businessId} contacts={contacts} />

        <BusinessReviews stats={stats} reviews={reviews} />
      </main>

      <SiteFooter />
    </>
  )
}
