import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getBusinessDetail,
  getBusinessReviews,
  getSimilarBusinesses,
  getUserReview,
  getUserActivity,
  computeReviewStats,
  TYPE_LABEL,
} from '@/lib/data/business-detail'
import { isOpenNow } from '@/lib/data/businesses'
import { getUserSession } from '@/lib/data/user'
import BusinessHero from '@/components/business-hero'
import BusinessActions from '@/components/business-actions'
import BusinessTabs from '@/components/business-tabs'
import FixedCta from '@/components/fixed-cta'
import BusinessCard from '@/components/business-card'
import { CrownGoldIcon } from '@/components/icons'
import styles from './business.module.css'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const detail = await getBusinessDetail(slug)

  if (!detail) {
    return { title: 'مش موجود | EAH' }
  }

  const { business } = detail
  return {
    title: `${business.name} | EAH`,
    description:
      business.description ??
      business.hook ??
      `${business.name} — ${TYPE_LABEL[business.business_type]} في ${business.area ?? 'شبين القناطر'}`,
  }
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params

  const detail = await getBusinessDetail(slug)
  if (!detail) notFound()

  const { business, contacts } = detail

  const [reviews, similar, session] = await Promise.all([
    getBusinessReviews(business.id, 50),
    getSimilarBusinesses(business.id, business.business_type, 8),
    getUserSession(),
  ])

  const reviewStats = computeReviewStats(reviews)
  const isLoggedIn = !!session
  const [isFavorite, isFollowing] = session
    ? await Promise.all([
        getUserActivity(business.id, session.userId, 'favorite'),
        getUserActivity(business.id, session.userId, 'follow'),
      ])
    : [false, false]
  const isOwner = session?.userId === business.owner_profile_id
  const userReview = session && isLoggedIn ? await getUserReview(business.id, session.userId) : null
  const hasReviewed = !!userReview

  // Fisher-Yates shuffle (client-stable seed from business.id)
  const seededSimilar = similar.slice(0, 4).sort((a, b) => {
    const h1 = (a.id.charCodeAt(0) + business.id.charCodeAt(0)) % 1000
    const h2 = (b.id.charCodeAt(0) + business.id.charCodeAt(0)) % 1000
    return h1 - h2
  })

  const isOpen = isOpenNow(business.working_hours)
  const whatsapp = contacts.find((c) => c.method_type === 'whatsapp')?.value ?? null
  const phone = contacts.find((c) => c.method_type === 'phone')?.value ?? null

  const hasWhatsapp = !!whatsapp && business.accepts_whatsapp_orders

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* ─── Hero ─── */}
        <BusinessHero detail={detail} isOpen={isOpen} />

        {/* ─── Quick Actions ─── */}
        <div className={styles.actionsWrap}>
          <BusinessActions
            businessId={business.id}
            businessSlug={business.slug}
            businessName={business.name}
            isLoggedIn={!!session}
            whatsapp={whatsapp}
            phone={phone}
            isOpen={isOpen}
            acceptsWhatsapp={business.accepts_whatsapp_orders}
            isFavorite={isFavorite}
            isFollowing={isFollowing}
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
                  {TYPE_LABEL[business.business_type]} تانية قريبة
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
        businessName={business.name}
        whatsapp={hasWhatsapp ? whatsapp : null}
        phone={phone}
        isLoggedIn={!!session}
        isOpen={isOpen}
      />
    </main>
  )
}
