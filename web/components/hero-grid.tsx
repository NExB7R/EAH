'use client'

import Link from 'next/link'
import WmImage from './wm-image'
import {
  MapPinIcon,
  StarIcon,
  UtensilsIcon,
  PillIcon,
  CartIcon,
  BikeIcon,
  SparklesIcon,
  SparkleStarIcon,
} from './icons'
import { useInfiniteList } from '@/lib/hooks/use-infinite-list'
import type { Business } from '@/lib/data'
import styles from './hero-grid.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Hero Grid
//   • أول كارت كبير (Hero) + الباقي صغير
//   • Infinite scroll — 12 كل مرة
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
  variant: 'new' | 'nearby'
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

export default function HeroGrid({
  businesses,
  variant,
  pageSize = 12,
}: Props) {
  const { visible, hasMore, remaining, sentinelRef } =
    useInfiniteList<Business>({ items: businesses, pageSize })

  const isNew = variant === 'new'

  return (
    <>
      <div className={styles.grid}>
        {visible.map((b, i) => {
          const meta = TYPE_META[b.business_type] ?? TYPE_META.misc!
          const TypeIcon = meta.Icon
          const rating =
            b.rating_count > 0
              ? b.rating_avg.toFixed(1)
              : b.trust_score
              ? (b.trust_score / 20).toFixed(1)
              : null
          const isHero = i === 0

          return (
            <Link
              key={b.id}
              href={`/businesses/${b.slug}`}
              className={`${styles.card} ${isHero ? styles.hero : ''} ${
                isNew ? styles.newTone : styles.nearbyTone
              }`}
            >
              <div className={styles.imageWrap}>
                {b.cover_image_url ? (
                  <WmImage
                    src={b.cover_image_url}
                    alt={b.name}
                    fill
                    sizes={isHero ? '(max-width: 640px) 100vw, 50vw' : '(max-width: 640px) 50vw, 25vw'}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.imageFallback} aria-hidden>
                    <TypeIcon size={isHero ? 56 : 32} />
                  </div>
                )}
                <div className={styles.imageOverlay} aria-hidden />

                {isNew && (
                  <span className={styles.newBadge}>
                    <SparkleStarIcon size={10} />
                    جديد
                  </span>
                )}

                {rating && (
                  <span className={styles.rating}>
                    <StarIcon size={11} />
                    {rating}
                  </span>
                )}
              </div>

              <div className={styles.body}>
                <h3 className={styles.name}>{b.name}</h3>
                <p className={styles.meta}>
                  <TypeIcon size={12} />
                  <span>{meta.label}</span>
                  {b.area && (
                    <>
                      <span className={styles.dot}>·</span>
                      <MapPinIcon size={11} />
                      <span>{b.area}</span>
                    </>
                  )}
                </p>
                {isHero && b.hook && (
                  <p className={styles.hook}>{b.hook}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

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
