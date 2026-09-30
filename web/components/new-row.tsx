import Link from 'next/link'
import WmImage from './wm-image'
import {
  SparkleStarIcon,
  ArrowLeftIcon,
  MapPinIcon,
  StarIcon,
  UtensilsIcon,
  PillIcon,
  CartIcon,
  BikeIcon,
  SparklesIcon,
} from './icons'
import RowCarousel from './row-carousel'
import type { Business } from '@/lib/data'
import styles from './new-row.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — New Row (Home — Single Row Carousel)
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

export default function NewRow({ businesses, limit = 12 }: Props) {
  if (businesses.length === 0) return null
  const visible = businesses.slice(0, limit)

  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}>
              <SparkleStarIcon size={22} />
            </span>
            <h2 className={styles.title}>الجديد</h2>
          </div>

          <Link href="/new" className={styles.viewAll}>
            <span>شوف الكل</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </header>

        <div className={styles.neonLine} aria-hidden />

        <RowCarousel accent="#F472B6">
          {visible.map((b) => {
            const meta = TYPE_META[b.business_type] ?? TYPE_META.misc!
            const TypeIcon = meta.Icon
            const rating =
              b.rating_count > 0
                ? b.rating_avg.toFixed(1)
                : b.trust_score
                  ? (b.trust_score / 20).toFixed(1)
                  : null

            return (
              <Link key={b.id} href={`/businesses/${b.slug}`} className={styles.card}>
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

                  <span className={styles.newBadge}>
                    <SparkleStarIcon size={10} />
                    جديد
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
                </div>
              </Link>
            )
          })}
        </RowCarousel>
      </div>
    </section>
  )
}
