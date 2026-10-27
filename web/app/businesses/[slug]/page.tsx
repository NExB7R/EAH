import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getBusinessDetail,
  isBusinessOwner,
  getBusinessReviews,
  getSimilarBusinesses,
  getUserReview,
  getUserActivity,
  computeReviewStats,
  getBusinessOffers,
} from '@/lib/data/business-detail'
import { getBusinessTypeLabel } from '@/lib/business-type-label'
import BusinessNotice from '@/components/business-notice'
import { getFeatureFlags } from '@/lib/features'
import type { BusinessDetail } from '@/lib/data/business-detail'
import { getUserSession } from '@/lib/data/user'
import { getComments, getMyFollowingRootIds } from '@/lib/data/comments'
import BusinessHero from '@/components/business-hero'
import BusinessActions from '@/components/business-actions'
import BusinessTabs from '@/components/business-tabs'
import BusinessCache from '@/components/business-cache'
import FixedCta from '@/components/fixed-cta'
import BusinessCard from '@/components/business-card'
import { CrownGoldIcon, ArrowLeftIcon } from '@/components/icons'
import styles from './business.module.css'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const detail = await getBusinessDetail(slug)

  if (!detail) {
    return { title: 'مش موجود · EAH' }
  }

  const { business } = detail
  return {
    title: `${business.name} · EAH`,
    description:
      business.description ??
      business.hook ??
      `${business.name} — ${getBusinessTypeLabel(business)} في ${business.area ?? 'شبين القناطر'}`,
  }
}

// ═══════════════════════════════════════════════════════════
// JSON-LD Schema (LocalBusiness) — لـ SEO
// ═══════════════════════════════════════════════════════════

function buildJsonLd(
  business: BusinessDetail['business'],
  contacts: BusinessDetail['contacts'],
) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eah-sq.vercel.app'
  const url = `${SITE_URL}/businesses/${business.slug}`

  const sameAs: string[] = []
  for (const c of contacts) {
    if (c.method_type === 'facebook' || c.method_type === 'instagram') sameAs.push(c.value)
  }

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': url,
    name: business.name,
    url,
    description: business.description ?? business.hook ?? undefined,
    image: business.cover_image_url ?? undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: business.area ?? 'شبين القناطر',
      addressRegion: 'القليوبية',
      addressCountry: 'EG',
      streetAddress: business.address_text ?? undefined,
    },
  }

  if (sameAs.length > 0) schema.sameAs = sameAs

  if (business.location) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.location.lat,
      longitude: business.location.lng,
    }
  }

  if (business.rating_count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.rating_avg,
      reviewCount: business.rating_count,
      bestRating: 5,
      worstRating: 1,
    }
  }

  const hours = business.working_hours
  if (hours && typeof hours === 'object') {
    const dayMap: Record<string, string> = {
      sun: 'Sunday',
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
    }
    const spec: Record<string, unknown>[] = []
    for (const [day, h] of Object.entries(hours)) {
      if (!h || typeof h !== 'object') continue
      const dayObj = h as { open?: string; close?: string }
      if (!dayObj.open || !dayObj.close) continue
      spec.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${dayMap[day] ?? 'Monday'}`,
        opens: dayObj.open,
        closes: dayObj.close,
      })
    }
    if (spec.length > 0) schema.openingHoursSpecification = spec
  }

  return schema
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params

  const detail = await getBusinessDetail(slug)
  if (!detail) notFound()

  const { business, contacts } = detail

  const [reviews, similar, session, flags, offers, comments] = await Promise.all([
    getBusinessReviews(business.id, 50),
    getSimilarBusinesses(business.id, business.business_type, 8),
    getUserSession(),
    getFeatureFlags(),
    getBusinessOffers(business.id, 6),
    getComments(business.id),
  ])

  const reviewStats = computeReviewStats(reviews)
  const isLoggedIn = !!session
  const [isOwner, isFavorite, isFollowing] = session
    ? await Promise.all([
        isBusinessOwner(business.id, session.userId),
        getUserActivity(business.id, session.userId, 'favorite'),
        getUserActivity(business.id, session.userId, 'follow'),
      ])
    : [false, false, false]

  const followingRootIds =
    session && comments.length > 0 ? await getMyFollowingRootIds(business.id, session.userId) : []
  const userReview = session && isLoggedIn ? await getUserReview(business.id, session.userId) : null
  const hasReviewed = !!userReview

  // Fisher-Yates shuffle (client-stable seed from business.id)
  const seededSimilar = similar.slice(0, 4).sort((a, b) => {
    const h1 = (a.id.charCodeAt(0) + business.id.charCodeAt(0)) % 1000
    const h2 = (b.id.charCodeAt(0) + business.id.charCodeAt(0)) % 1000
    return h1 - h2
  })

  const isOpen = business.is_open
  const acceptsWhatsapp = business.accepts_whatsapp_orders
  const ordersEnabled = flags.orders_enabled && business.accepts_orders

  const menuImages = detail.menu.map((m) => m.storage_path)
  const offersList = offers.map((o) => ({ title: o.title, image: o.image_url }))

  return (
    <main className={styles.page}>
      <BusinessCache slug={business.slug} detail={detail} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // escape < → \u003c يمنع XSS لو اسم النشاط فيه </script>
          __html: JSON.stringify(buildJsonLd(business, contacts)).replace(
            /</g,
            '\\u003c',
          ),
        }}
      />
      <div className={styles.container}>
        {/* ─── Owner Banner ─── */}
        {isOwner && (
          <div className={styles.ownerBanner}>
            <span className={styles.ownerLabel}>إنت صاحب النشاط ده</span>
            <Link href="/merchant/business" className={styles.ownerLink}>
              <span>إدارة النشاط</span>
              <ArrowLeftIcon size={14} />
            </Link>
            <Link href="/merchant" className={styles.ownerLinkGhost}>
              <span>لوحة التحكم</span>
            </Link>
          </div>
        )}

        {/* ─── Notice Banner ─── */}
        {detail.notice && <BusinessNotice notice={detail.notice} />}

        {/* ─── Hero ─── */}
        <BusinessHero detail={detail} isOpen={isOpen} />

        {/* ─── Quick Actions ─── */}
        <div className={styles.actionsWrap}>
          <BusinessActions
            businessId={business.id}
            businessSlug={business.slug}
            businessName={business.name}
            isLoggedIn={!!session}
            isOpen={isOpen}
            acceptsWhatsapp={business.accepts_whatsapp_orders}
            ordersEnabled={ordersEnabled}
            isFavorite={isFavorite}
            isFollowing={isFollowing}
            menuImages={menuImages}
            offers={offersList}
          />
        </div>

        {/* ─── Tabs ─── */}
        <div className={styles.tabsWrap}>
          <BusinessTabs
            detail={detail}
            reviews={reviews}
            reviewStats={reviewStats}
            isLoggedIn={isLoggedIn}
            hasReviewed={hasReviewed}
            isOwner={isOwner}
            reviewsEnabled={flags.reviews_enabled}
            comments={comments}
            currentUserId={session?.userId ?? null}
            followingRootIds={followingRootIds}
            offers={offers}
          />
        </div>

        {/* ─── Similar ─── */}
        {seededSimilar.length > 0 && (
          <section className={styles.similar}>
            <header className={styles.similarHeader}>
              <div className={styles.similarTitleWrap}>
                <span className={styles.similarIcon}>
                  <CrownGoldIcon size={18} />
                </span>
                <h2 className={styles.similarTitle}>
                  {getBusinessTypeLabel(business)} تانية قريبة
                </h2>
              </div>
            </header>

            <div className={styles.similarGrid}>
              {seededSimilar.map((b) => (
                <BusinessCard key={b.id} business={b} tone="purple" />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ─── Fixed CTA (Mobile) ─── */}
      <FixedCta
        businessId={business.id}
        businessSlug={business.slug}
        businessName={business.name}
        acceptsWhatsapp={acceptsWhatsapp}
        isLoggedIn={!!session}
        isOpen={isOpen}
        ordersEnabled={ordersEnabled}
        defaultName={session?.displayName ?? ''}
        menuImages={menuImages}
        offers={offersList}
        isOwner={isOwner}
      />
    </main>
  )
}
