import Link from 'next/link'
import WmImage from './wm-image'
import {
  NavigationIcon,
  ArrowLeftIcon,
  MapPinIcon,
  StarIcon,
  UtensilsIcon,
  PillIcon,
  CartIcon,
  BikeIcon,
  SparklesIcon,
} from './icons'
import SectionBadge from './section-badge'
import NearbyCta from './nearby-cta'
import type { Business } from '@/lib/data'
import styles from './nearby-grid.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Nearby Grid (Home — 4 cards, 2×2 / 4×1)
//   • CTA الموقع جوه الإطار (يختفي لما يفعّل)
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
}

type TypeMeta = { label: string; Icon: typeof UtensilsIcon }

const TYPE_META: Record<string, TypeMeta> = {
  restaurant: { label: 'مطعم', Icon: UtensilsIcon },
  pharmacy: { label: 'صيدلية', Icon: PillIcon },
  supermarket: { label: 'ماركت', Icon: CartIcon },
  delivery_office: { label: 'توصيل', Icon: BikeIcon },
  misc: { label: 'أنشطة', Icon: SparklesIcon },
}

export default function NearbyGrid({ businesses }: Props) {
  if (businesses.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}>
              <NavigationIcon size={22} />
            </span>
            <h2 className={styles.title}>قريب منك</h2>
            <SectionBadge variant="nearby" />
          </div>

          <Link href="/nearby" className={styles.viewAll}>
            <span>شوف الكل</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </header>

        <div className={styles.neonLine} aria-hidden />

        <NearbyCta />

        <div className={styles.grid}>
          {businesses.slice(0, 4).map((b) => {
            const meta = TYPE_META[b.business_type] ?? TYPE_META.misc!
            const TypeIcon = meta.Icon
            const rating = b.rating_count > 0
              ? b.rating_avg.toFixed(1)
              : b.trust_score
              ? (b.trust_score / 20).toFixed(1)
              : null

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
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className={styles.image}
                    />
                  ) : (
                    <div className={styles.imageFallback} aria-hidden>
                      <TypeIcon size={36} />
                    </div>
                  )}
                  <div className={styles.imageOverlay} aria-hidden />

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
        </div>
      </div>
    </section>
  )
}
