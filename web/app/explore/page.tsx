import type { Metadata } from 'next'
import Link from 'next/link'
import ExploreSearch from '@/components/explore-search'
import SecondaryHero from '@/components/secondary-hero'
import BusinessCard from '@/components/business-card'
import SectionBadge from '@/components/section-badge'
import type { BadgeVariant } from '@/components/section-badge'
import { TargetIcon } from '@/components/icons'
import {
  getPublishedBusinesses,
  getBusinessesByType,
} from '@/lib/data/businesses'
import type { BusinessType } from '@/lib/data/businesses'
import { smartSearch } from '@/lib/search'
import { sortByTrust, dailyShuffle } from '@/lib/ranking'
import styles from './explore.module.css'

export const metadata: Metadata = {
  title: 'اكتشف | EAH',
  description: 'اكتشف أحسن الأماكن حواليك في شبين القناطر والقرى',
}

export const dynamic = 'force-dynamic'

type SearchParams = {
  q?: string
  type?: string
  suggest?: string
  page?: string
}

const PAGE_SIZE = 12

const VALID_TYPES: BusinessType[] = [
  'restaurant', 'pharmacy', 'supermarket', 'delivery_office', 'misc',
]

const TYPE_TITLES: Record<string, string> = {
  restaurant: 'مطاعم',
  pharmacy: 'صيدليات',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
  misc: 'أنشطة أخرى',
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const type = params.type?.trim() ?? ''
  const suggest = params.suggest === '1'
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  let businesses = await getPublishedBusinesses()
  let title = 'اكتشف'
  let badgeLabel = 'كل الأنشطة'
  let badgeVariant: BadgeVariant = 'discover'

  if (type && VALID_TYPES.includes(type as BusinessType)) {
    businesses = await getBusinessesByType(type as BusinessType, 100)
    title = TYPE_TITLES[type] ?? 'اكتشف'
    badgeLabel = title
  }

  if (suggest) {
    businesses = dailyShuffle(businesses).slice(0, 20)
    title = 'ترشيحات ليك'
    badgeLabel = 'ترشيحاتك'
    badgeVariant = 'suggest'
  }

  if (q) {
    const results = smartSearch(businesses, q)
    businesses = results.map((r) => r.business)
    title = 'نتائج البحث'
    badgeLabel = `"${q}"`
    badgeVariant = 'search'
  } else if (!suggest && !type) {
    businesses = sortByTrust(businesses)
  }

  const totalCount = businesses.length
  const startIdx = (page - 1) * PAGE_SIZE
  const endIdx = startIdx + PAGE_SIZE
  const hasMore = endIdx < totalCount
  businesses = businesses.slice(startIdx, endIdx)

  return (
    <main className={styles.page}>
      <SecondaryHero
        activeKey="discover"
        title={title}
        Icon={TargetIcon}
        tone="purple"
        count={totalCount}
      />

      <div className={styles.content}>
        <div className={styles.searchWrap}>
          <ExploreSearch initialQuery={q} />
        </div>

        <div className={styles.badgeRow}>
          <SectionBadge variant={badgeVariant} label={badgeLabel} size="md" />
        </div>

        {businesses.length > 0 ? (
          <>
            <div className={styles.grid}>
              {businesses.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>

            {hasMore && (
              <div className={styles.loadMoreWrap}>
                <Link
                  href={`/explore?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(type ? { type } : {}),
                    ...(suggest ? { suggest: '1' } : {}),
                    page: String(page + 1),
                  }).toString()}`}
                  className={styles.loadMore}
                >
                  شوف المزيد
                </Link>
                <span className={styles.counter}>
                  بتشوف {businesses.length} من {totalCount}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <TargetIcon size={44} />
            </div>
            <h2 className={styles.emptyTitle}>مفيش نتائج</h2>
            <p className={styles.emptyText}>
              جرب تدور بكلمة تانية، أو اكتشف التصنيفات.
            </p>
            <Link href="/explore" className={styles.emptyBtn}>
              اكتشف كل حاجة
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
