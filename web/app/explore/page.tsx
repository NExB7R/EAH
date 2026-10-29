import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import ExploreSearch from '@/components/explore-search'
import ExploreFilters from '@/components/explore-filters'
import SecondaryHero from '@/components/secondary-hero'
import LoadMoreGrid from '@/components/load-more'
import { TargetIcon } from '@/components/icons'
import { getPublishedBusinesses } from '@/lib/data/businesses'
import { smartSearch } from '@/lib/search'
import { parseFilters, applyFilters, resolveResultSort } from '@/lib/search/filters'
import { getActiveAreas } from '@/lib/data/areas'
import styles from './explore.module.css'

export const metadata: Metadata = {
  title: 'اكتشف',
  description: 'اكتشف أحسن الأماكن حواليك في شبين القناطر والقرى',
}

export const dynamic = 'force-dynamic'

type SearchParams = {
  q?: string
  type?: string
  area?: string
  open?: string
  online?: string
  offers?: string
  new?: string
  rating?: string
  distance?: string
  lat?: string
  lng?: string
  sort?: string
  verified?: string
  suggest?: string
}

const TYPE_TITLES: Record<string, string> = {
  restaurant: 'مطاعم',
  pharmacy: 'صيدليات',

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
  const suggest = params.suggest === '1'
  const filters = parseFilters(params as Record<string, string | undefined>)
  const resultSort = resolveResultSort(Boolean(q), params.sort, filters)

  let businesses = await getPublishedBusinesses()

  if (q) {
    businesses = smartSearch(businesses, q).map((r) => r.business)
    businesses = applyFilters(businesses, { ...filters, sort: resultSort })
  } else {
    businesses = applyFilters(businesses, filters)
  }

  // العنوان
  let title = 'اكتشف'
  if (suggest && !q) {
    title = 'ترشيحات ليك'
  } else if (q) {
    title = 'نتائج البحث'
  } else if (filters.types.length === 1) {
    title = TYPE_TITLES[filters.types[0]!] ?? 'اكتشف'
  } else if (filters.userLocation) {
    title = 'قريب منك'
  }

  const totalCount = businesses.length

  // Counts لكل فلتر (من المجموعة الكاملة قبل الفلترة — عشان يعرض "المتاح دلوقتي")
  const allBusinesses = await getPublishedBusinesses()
  const activeAreas = await getActiveAreas()
  const counts = {
    types: {
      restaurant: allBusinesses.filter((b) => b.business_type === 'restaurant').length,
      pharmacy: allBusinesses.filter((b) => b.business_type === 'pharmacy').length,

      delivery_office: allBusinesses.filter((b) => b.business_type === 'delivery_office').length,
      misc: allBusinesses.filter((b) => b.business_type === 'misc').length,
    },
    verified: allBusinesses.filter((b) => b.is_verified).length,
  }

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

        <Suspense fallback={null}>
          <ExploreFilters
            area={filters.area}
            counts={counts}
            activeAreas={activeAreas}
            sort={resultSort}
            hasQuery={Boolean(q)}
          />
        </Suspense>

        {businesses.length > 0 ? (
          <LoadMoreGrid businesses={businesses} tone="purple" pageSize={10} />
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <TargetIcon size={44} />
            </div>
            <h2 className={styles.emptyTitle}>مفيش نتائج</h2>
            <p className={styles.emptyText}>
              جرب فلتر تاني، أو شيل بعض الفلاتر — يمكن لقينا حاجة أحسن.
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
