import Link from 'next/link'
import WmImage from './wm-image'
import {
  TrendingUpIcon,
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  UtensilsIcon,
  PillIcon,
  CartIcon,
  BikeIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from './icons'
import RowCarousel from './row-carousel'
import type { Business } from '@/lib/data'
import styles from './trending-row.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Trending Row (Home — Single Row Carousel)
//   • صف واحد أفقي — auto-scroll + أسهم مخفية
//   • rank badge على كل كارت
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
  limit?: number
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

export default function TrendingRow({ businesses, limit = 12 }: Props) {
  if (businesses.length === 0) return null
  const visible = businesses.slice(0, limit)

  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}>
              <TrendingUpIcon size={22} />
            </span>
            <h2 className={styles.title}>الترند</h2>
          </div>

          <Link href="/trends" className={styles.viewAll}>
            <span>شوف الكل</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </header>

        <div className={styles.neonLine} aria-hidden />

        <RowCarousel accent="#FDBA74">
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
              <Link
                key={b.id}
                href={`/businesses/${b.slug}`}
                className={styles.card}
              >
                <div className={styles.imageWrap}>
                  {b.cover_image_url ? (
                    <WmImage
                      src={b.cover_image_url}
                      alt={b.name}
                      fill
                      sizes="220px"
                      className={styles.image}
                    />
                  ) : (
                    <div className={styles.imageFallback} aria-hidden>
                      <TypeIcon size={36} />
                    </div>
                  )}
                  <div className={styles.imageOverlay} aria-hidden />

                  <span className={`${styles.rank} ${rankClass(rank, styles)}`}>
                    #{rank}
                  </span>

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

                  {tierLabel && (
                    <span className={styles.tier}>
                      <ShieldCheckIcon size={11} />
                      {tierLabel}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </RowCarousel>
      </div>
    </section>
  )
}
