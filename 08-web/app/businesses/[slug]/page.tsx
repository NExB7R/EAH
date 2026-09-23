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
import BusinessMap from '@/components/business-map'
import BusinessShare from '@/components/business-share'
import BusinessOwnerTrial, { WhatsAppOrdersToggle } from '@/components/business-owner-trial'
import BusinessQuickActions from '@/components/business-quick-actions'
import BusinessHours from '@/components/business-hours'
import BusinessGallery from '@/components/business-gallery'
import BusinessMenu from '@/components/business-menu'
import { resolveCoords } from '@/lib/map-coords'
import LockedContent from '@/components/locked-content'
import BusinessBranchesSection from '@/components/business-branches-section'
import SectionSliderV3 from '@/components/section-slider-v3'
import SimpleFlipCard from '@/components/simple-flip-card'
import { getPublishedBusinesses } from '@/lib/data'

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

  // ═══ الأنشطة المشابهة (نفس النوع أو المنطقة) ═══
  const allBusinesses = await getPublishedBusinesses(50)
  const similar = allBusinesses
    .filter((b: any) => b.slug !== business.slug && (b.type === business.type || b.area === business.area))
    .slice(0, 12)

  const featuredList = allBusinesses
    .filter((b: any) => b.slug !== business.slug && (b.featured || b.badge === 'مميز'))
    .slice(0, 12)

  const trendingList = allBusinesses
    .filter((b: any) => b.slug !== business.slug)
    .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 12)

  // ═══ الفروع ═══
  let branches: any[] = []
  if (hasId) {
    const { createClient } = await import('@/lib/supabase-server')
    const sb = await createClient()
    const { data: br } = await sb
      .from('business_branches')
      .select('id,name,area,address_text,latitude,longitude,phone,whatsapp,is_primary')
      .eq('business_id', business.businessId!)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .order('sort_order')
    branches = br ?? []
  }

  const coords = resolveCoords(business.latitude, business.longitude, business.area)
  const phoneNum = contacts.find((c) => c.method_type === 'phone')?.value ?? null
  const waNum = contacts.find((c) => c.method_type === 'whatsapp')?.value ?? phoneNum

  return (
    <>
      <FloatingCapsuleHeader />
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
          trustScore={(business as any).trust_score}
          trustTier={(business as any).trust_tier}
        />

        {/* ═══ Quick Actions Bar ═══ */}
        {hasId && (
          <BusinessQuickActions
            businessId={business.businessId!}
            businessName={business.name}
            phone={phoneNum}
            whatsapp={waNum}
            slug={business.slug}
          />
        )}

        {/* ═══ Branches ═══ */}
        {branches.length > 0 && (
          <BusinessBranchesSection branches={branches} businessName={business.name} />
        )}

        {/* ═══ Gallery ═══ */}
        {business.gallery && business.gallery.length > 0 && (
          <BusinessGallery images={business.gallery} name={business.name} />
        )}

        {/* ═══ Hours ═══ */}
        {business.workingHours && Object.keys(business.workingHours).length > 0 && (
          <BusinessHours hours={business.workingHours} />
        )}

        {/* ═══ Menu ═══ */}
        {business.menu && business.menu.length > 0 && (
          <BusinessMenu pages={business.menu} name={business.name} />
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
              <BusinessReviews stats={stats} reviews={reviews} businessId={business.businessId} />
            </LockedContent>
          ) : (
            <BusinessReviews stats={stats} reviews={reviews} businessId={business.businessId} />
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

      {/* ═══ سلايدرات في آخر الصفحة ═══ */}
      {similar.length > 0 && (
        <SectionSliderV3
          title="أماكن شبهه"
          subtitle="نفس الروح، تجارب تانية"
          seeAllHref={`/explore?type=${business.type}`}
          variant="similar"
        >
          {similar.map((b) => (
            <SimpleFlipCard key={b.slug} business={b as any} variant="default" />
          ))}
        </SectionSliderV3>
      )}

      {featuredList.length > 0 && (
        <SectionSliderV3
          title="المميزين"
          subtitle="أماكن اختارها فريقنا"
          seeAllHref="/featured"
          variant="featured"
        >
          {featuredList.map((b) => (
            <SimpleFlipCard key={b.slug} business={b as any} variant="featured" />
          ))}
        </SectionSliderV3>
      )}

      {trendingList.length > 0 && (
        <SectionSliderV3
          title="الترند دلوقتي"
          subtitle="الناس بتدور عليها"
          seeAllHref="/trends"
          variant="trending"
        >
          {trendingList.map((b) => (
            <SimpleFlipCard key={b.slug} business={b as any} variant="trending" />
          ))}
        </SectionSliderV3>
      )}

      <SiteFooter />
    </>
  )
}
