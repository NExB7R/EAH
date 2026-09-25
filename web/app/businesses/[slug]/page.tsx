import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/page-header'
import WmImage from '@/components/wm-image'
import {
  getBusinessBySlug,
  isOpenNow,
} from '@/lib/data/businesses'
import {
  StarIcon,
  BadgeCheckIcon,
} from '@/components/icons'
import styles from './business.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business Page (temporary)
// ═══════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
  misc: 'نشاط',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)

  if (!business) {
    return { title: 'مش موجود | EAH' }
  }

  return {
    title: `${business.name} | EAH`,
    description: business.description ?? business.hook ?? `${business.name} في شبين القناطر`,
  }
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)

  if (!business) {
    notFound()
  }

  const isOpen = isOpenNow(business.working_hours)
  const label = TYPE_LABELS[business.business_type] ?? 'نشاط'

  return (
    <main className={styles.page}>
      <PageHeader title={business.name} />

      <div className={styles.content}>
        <div className={styles.cover}>
          {business.cover_image_url ? (
            <WmImage
              src={business.cover_image_url}
              alt={business.name}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className={styles.coverImg}
              priority
            />
          ) : (
            <div className={styles.placeholder} aria-hidden />
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.head}>
            <h1 className={styles.name}>{business.name}</h1>
            {business.trust_tier === 'trusted' && (
              <span className={styles.verified}>
                <BadgeCheckIcon size={16} />
              </span>
            )}
          </div>

          <div className={styles.meta}>
            <span className={styles.type}>{label}</span>
            {business.area && (
              <>
                <span className={styles.dot} aria-hidden>·</span>
                <span>{business.area}</span>
              </>
            )}
            <span className={styles.dot} aria-hidden>·</span>
            <span className={isOpen ? styles.open : styles.closed}>
              {isOpen ? 'مفتوح حالاً' : 'مغلق'}
            </span>
          </div>

          {business.hook && (
            <p className={styles.hook}>{business.hook}</p>
          )}

          <div className={styles.stats}>
            <div className={styles.stat}>
              <StarIcon size={18} />
              <span className={styles.statVal}>{business.trust_score}</span>
              <span className={styles.statLabel}>ثقة</span>
            </div>
            {business.successful_orders > 0 && (
              <div className={styles.stat}>
                <span className={styles.statVal}>{business.successful_orders}</span>
                <span className={styles.statLabel}>طلب</span>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <Link href="/explore" className={styles.backBtn}>
              اكتشف المزيد
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
