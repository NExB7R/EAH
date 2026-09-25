import type { Metadata } from 'next'
import Link from 'next/link'
import ExploreSearch from '@/components/explore-search'
import PageHeader from '@/components/page-header'
import BusinessCard from '@/components/business-card'
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
}

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

  let businesses = await getPublishedBusinesses()
  let title = 'اكتشف'

  if (type && VALID_TYPES.includes(type as BusinessType)) {
    businesses = await getBusinessesByType(type as BusinessType, 100)
    title = TYPE_TITLES[type] ?? 'اكتشف'
  }

  if (suggest) {
    businesses = dailyShuffle(businesses).slice(0, 20)
    title = 'ترشيحات ليك'
  }

  if (q) {
    const results = smartSearch(businesses, q)
    businesses = results.map((r) => r.business)
    title = `نتائج: "${q}"`
  } else if (!suggest && !type) {
    businesses = sortByTrust(businesses)
  }

  return (
    <main className={styles.page}>
      <PageHeader title={title} count={businesses.length}>
        <ExploreSearch initialQuery={q} />
      </PageHeader>

      <div className={styles.content}>
        {businesses.length > 0 ? (
          <div className={styles.grid}>
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔍</div>
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
