import Link from 'next/link'
import WmImage from './wm-image'
import {
  TagIcon,
  ArrowLeftIcon,
  MapPinIcon,
} from './icons'
import type { Offer } from '@/lib/data'
import styles from './offers-strip.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Offers Strip (Home — Horizontal Snap)
//   • سحب أفقي على الموبايل
//   • Server Component — صفر JS
//   • برتقالي + ذهبي (مميز عن المميزون والترند)
// ═══════════════════════════════════════════════════════════

type Props = {
  offers: Offer[]
}

export default function OffersStrip({ offers }: Props) {
  if (offers.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}>
              <TagIcon size={22} />
            </span>
            <h2 className={styles.title}>العروض</h2>
            <span className={styles.titleBadge}>Offers</span>
          </div>

          <Link href="/offers" className={styles.viewAll}>
            <span>شوف الكل</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </header>

        <div className={styles.neonLine} aria-hidden />

        <div className={styles.scroller}>
          <div className={styles.strip}>
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Card ───
function OfferCard({ offer }: { offer: Offer }) {
  const href = offer.business?.slug
    ? `/businesses/${offer.business.slug}`
    : '#'

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.imageWrap}>
        {offer.image_url ? (
          <WmImage
            src={offer.image_url}
            alt={offer.title}
            fill
            sizes="(max-width: 640px) 60vw, 240px"
            className={styles.image}
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden>
            <TagIcon size={32} />
          </div>
        )}
        <div className={styles.imageOverlay} aria-hidden />

        <span className={styles.badge}>
          <TagIcon size={11} />
          عرض
        </span>

        {offer.price !== null && offer.price > 0 && (
          <span className={styles.price}>{offer.price} ج.م</span>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{offer.title}</h3>
        {offer.business && (
          <p className={styles.meta}>
            <span className={styles.biz}>{offer.business.name}</span>
            {offer.business.area && (
              <>
                <span className={styles.dot}>·</span>
                <MapPinIcon size={11} />
                <span>{offer.business.area}</span>
              </>
            )}
          </p>
        )}
      </div>
    </Link>
  )
}
