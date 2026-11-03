import Link from 'next/link'
import WmImage from './wm-image'
import { TagIcon, ArrowLeftIcon, MapPinIcon } from './icons'
import RowCarousel from './row-carousel'
import DistanceBadge from './distance-badge'
import type { Offer } from '@/lib/data'
import type { LatLng } from '@/lib/utils/distance'
import styles from './offers-strip.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Offers Strip (Home — Single Row Carousel)
// ═══════════════════════════════════════════════════════════

type Props = {
  offers: Offer[]
  viewerLocation: LatLng | null
}

export default function OffersStrip({ offers, viewerLocation }: Props) {
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
          </div>

          <Link href="/offers" className={styles.viewAll}>
            <span>شوف الكل</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </header>

        <div className={styles.neonLine} aria-hidden />

        <RowCarousel accent="#C77DFF">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} viewerLocation={viewerLocation} />
          ))}
        </RowCarousel>
      </div>
    </section>
  )
}

export function OfferCard({ offer, layout = 'carousel', viewerLocation = null }: { offer: Offer; layout?: 'carousel' | 'grid'; viewerLocation?: LatLng | null }) {
  const href = offer.business?.slug ? `/businesses/${offer.business.slug}` : '/offers'
  const isTestOffer = offer.title.includes('اختبار EAH') || offer.description?.includes('اصطناعي')

  return (
    <Link href={href} className={`${styles.card} ${layout === "grid" ? styles.gridCard : ""}`}>
      <div className={styles.imageWrap}>
        {offer.image_url ? (
          <WmImage
            src={offer.image_url}
            alt={offer.title}
            fill
            sizes="220px"
            className={styles.image}
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden>
            <TagIcon size={32} />
          </div>
        )}
        <div className={styles.imageOverlay} aria-hidden />
        {viewerLocation && offer.business?.location && (
          <DistanceBadge
            lat={offer.business.location.lat}
            lng={offer.business.location.lng}
            userLocation={viewerLocation}
          />
        )}

        <span className={styles.badge}>
          <TagIcon size={11} />
          {isTestOffer ? 'عرض اختبار' : 'عرض'}
        </span>

        {offer.price !== null && offer.price > 0 && (
          <span className={styles.price}>{offer.price} ج.م</span>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{offer.title}</h3>
        {offer.description?.trim() && (
          <p className={styles.description}>{offer.description}</p>
        )}
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
