'use client'

import Link from 'next/link'
import WmImage from './wm-image'
import {
  ChevronLeftIcon,
  MapPinIcon,
  StarIcon,
  ShieldCheckIcon,
  UtensilsIcon,
  PillIcon,
  CartIcon,
  BikeIcon,
  SparklesIcon,
  TrendingUpIcon,
  TagIcon,
} from './icons'
import { useInfiniteList } from '@/lib/hooks/use-infinite-list'
import type { Business } from '@/lib/data'
import styles from './editorial-list.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Editorial List
//   • قائمة عمودية (زي Spotify / Apple Music)
//   • Infinite scroll — 12 كل مرة
//   • variant="trend" → رقم الترند
//   • variant="offer" → سعر العرض
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
  variant: 'trend' | 'offer'
  pageSize?: number
}

type TypeMeta = { label: string; Icon: typeof UtensilsIcon }

const TYPE_META: Record<string, TypeMeta> = {
  restaurant: { label: 'مطعم', Icon: UtensilsIcon },
  pharmacy: { label: 'صيدلية', Icon: PillIcon },
  supermarket: { label: 'ماركت', Icon: CartIcon },
  delivery_office: { label: 'توصيل', Icon: BikeIcon },
  misc: { label: 'أنشطة', Icon: SparklesIcon },
}

const TIER_LABEL: Record<string, string> = {
  trusted: 'موثوق',
  verified: 'مُوثَّق',
  new: 'جديد',
}

function rankClass(rank: number, s: Record<string, string>): string {
  if (rank === 1) return s.rank1!
  if (rank === 2) return s.rank2!
  if (rank === 3) return s.rank3!
  return s.rankN!
}

export default function EditorialList({
  businesses,
  variant,
  pageSize = 12,
}: Props) {
  const { visible, hasMore, remaining, sentinelRef } =
    useInfiniteList<Business>({ items: businesses, pageSize })

  const isTrend = variant === 'trend'

  return (
    <>
      <ol className={styles.list}>
        {visible.map((b, i) => {
          const rank = i + 1
          const meta = TYPE_META[b.business_type] ?? TYPE_META.misc!
          const TypeIcon = meta.Icon
          const rating =
            b.rating_count > 0
              ? b.rating_avg.toFixed(1)
              : b.trust_score
              ? (b.trust_score / 20).toFixed(1)
              : null
          const tierLabel = TIER_LABEL[b.trust_tier] ?? null

          return (
            <li key={b.id} className={styles.row}>
              <Link
                href={`/businesses/${b.slug}`}
                className={styles.rowLink}
              >
                <span
                  className={`${styles.leading} ${
                    isTrend ? rankClass(rank, styles) : styles.leadingOffer
                  }`}
                >
                  {isTrend ? (
                    <>#{rank}</>
                  ) : (
                    <TagIcon size={18} />
                  )}
                </span>

                <span className={styles.thumb}>
                  {b.cover_image_url ? (
                    <WmImage
                      src={b.cover_image_url}
                      alt={b.name}
                      fill
                      sizes="80px"
                      className={styles.thumbImg}
                    />
                  ) : (
                    <span className={styles.thumbFallback} aria-hidden>
                      <TypeIcon size={26} />
                    </span>
                  )}
                </span>

                <span className={styles.info}>
                  <span className={styles.name}>{b.name}</span>
                  <span className={styles.metaRow}>
                    <TypeIcon size={12} />
                    <span>{meta.label}</span>
                    {b.area && (
                      <>
                        <span className={styles.dot}>·</span>
                        <MapPinIcon size={11} />
                        <span>{b.area}</span>
                      </>
                    )}
                  </span>
                  {b.hook && (
                    <span className={styles.hook}>{b.hook}</span>
                  )}
                </span>

                <span className={styles.trailing}>
                  {rating && (
                    <span className={styles.rating}>
                      <StarIcon size={11} />
                      {rating}
                    </span>
                  )}
                  {tierLabel && (
                    <span className={styles.tier}>
                      <ShieldCheckIcon size={11} />
                      {tierLabel}
                    </span>
                  )}
                  <ChevronLeftIcon size={16} className={styles.chev} />
                </span>
              </Link>
            </li>
          )
        })}
      </ol>

      {hasMore && (
        <div ref={sentinelRef} className={styles.sentinel}>
          <span className={styles.loader} aria-hidden />
          <span className={styles.remaining}>باقي {remaining} نشاط</span>
        </div>
      )}

      {!hasMore && businesses.length > 12 && (
        <div className={styles.end}>— دي كل الأنشطة —</div>
      )}
    </>
  )
}
