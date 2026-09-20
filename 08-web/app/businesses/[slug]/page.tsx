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
import BusinessFollowSection from '@/components/business-follow-section'
import CouponSection from '@/components/coupon-section'
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
import BusinessMap from '@/components/business-map'
import BusinessShare from '@/components/business-share'
import BusinessOwnerTrial, { WhatsAppOrdersToggle } from '@/components/business-owner-trial'
import { resolveCoords } from '@/lib/map-coords'
import LockedContent from '@/components/locked-content'

export const revalidate = 120

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business) return { title: 'النشاط مش موجود' }
  return { title: `${business.name}`, description: business.reason }
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

  const hasId = !!business.businessId

  const [stats, reviews, offers, contacts] = await Promise.all([
    hasId ? getBusinessStats(business.businessId!) : Promise.resolve(EMPTY_STATS),
    hasId ? getBusinessReviews(business.businessId!, 6) : Promise.resolve([]),
    hasId ? getBusinessOffers(business.businessId!) : Promise.resolve([]),
    hasId ? getBusinessContacts(business.businessId!) : Promise.resolve([]),
  ])

  const coords = resolveCoords(business.latitude, business.longitude, business.area)

  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      {hasId && <PageViewTracker businessId={business.businessId!} />}

      <main className="biz-page">
        {/* ═══ Hero + Breadcrumbs ═══ */}
        <BusinessHero
          business={{
            name: business.name,
            slug: business.slug,
            type: business.type,
            area: business.area,
            reason: business.reason,
            open: business.open,
            vibe: business.vibe,
            address: business.address,
            workingHours: business.workingHours,
            coverImage: business.cover_image_url,
            gallery: business.gallery ?? [],
            logo: business.logo ?? null,
          }}
          stats={{
            avg_rating: stats.avg_rating,
            review_count: stats.review_count,
            active_offers: stats.active_offers,
          }}
        />

        {/* ═══ Share Row ═══ */}
        {hasId && (
          <div className="biz-actions-row">
            <BusinessShare slug={business.slug} name={business.name} />
            <BusinessFollowSection slug={slug} businessId={business.businessId} />
          </div>
        )}

        {/* ═══ Owner Controls ═══ */}
        {hasId && <BusinessOwnerTrial businessId={business.businessId!} />}
        {hasId && (
          <WhatsAppOrdersToggle
            businessId={business.businessId!}
            initialEnabled={business.acceptsWhatsappOrders ?? false}
          />
        )}

        {/* ═══ Coupons ═══ */}
        <CouponSection slug={slug} />

        {/* ═══ Offers ═══ */}
        <BusinessOffers offers={offers} />

        {/* ═══ Order ═══ */}
        {hasId && business.acceptsWhatsappOrders && (
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

        {/* ═══ Contact ═══ */}
        {hasId && contacts.length > 0 && (
          <BusinessContact businessId={business.businessId!} contacts={contacts} />
        )}

        {/* ═══ Map ═══ */}
        {coords && (
          <BusinessMap
            lat={coords.lat}
            lng={coords.lng}
            name={business.name}
            area={business.area}
            address={business.address ?? undefined}
          />
        )}

        {/* ═══ Reviews ═══ */}
        <div id="reviews">
          {stats.review_count > 0 ? (
            <LockedContent
              title="التقييمات والآراء"
              hint="سجّل عشان تقرأ تجارب الناس وتشاركنا رأيك"
              minHeight={280}
            >
              <BusinessReviews stats={stats} reviews={reviews} />
            </LockedContent>
          ) : (
            <BusinessReviews stats={stats} reviews={reviews} />
          )}
        </div>

        {business.businessId && (
          <div className="biz-review-cta">
            <ReviewForm businessId={business.businessId} />
          </div>
        )}

        {/* ═══ Report ═══ */}
        {business.businessId && (
          <div className="biz-report-row">
            <ReportButton entityType="business" entityId={business.businessId} />
          </div>
        )}

        {/* ═══ Structured Data ═══ */}
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
              areaServed: { '@type': 'City', name: business.area },
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
                      url:
                        c.method_type !== 'phone' && c.method_type !== 'whatsapp'
                          ? c.value
                          : undefined,
                    })),
                  }
                : {}),
            }),
          }}
        />
      </main>

      {!business.hasOwner && (
        <BusinessClaimCTA businessName={typeof business?.name === 'string' ? business.name : undefined} />
      )}
      <SiteFooter />
    </>
  )
}
