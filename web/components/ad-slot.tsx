import Link from 'next/link'
import WmImage from './wm-image'
import { ExternalLinkIcon, TagIcon } from './icons'
import type { ActiveAd } from '@/lib/data/ads'
import { safeAdHref } from '@/lib/utils/safe-ad-link'
import styles from './ad-slot.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Ad Slot (display)
//   • يعرض إعلانات نشطة لـ slot معين
//   • لو مفيش، ما يعرضش حاجة
// ═══════════════════════════════════════════════════════════

type Props = {
  ads: ActiveAd[]
  variant?: 'banner' | 'card' | 'inline'
}

export default function AdSlot({ ads, variant = 'banner' }: Props) {
  if (ads.length === 0) return null

  const ad = ads[0]
  if (!ad) return null
  const safeLinkUrl = safeAdHref(ad.link_url)

  const inner = (
    <>
      <div className={styles.imageWrap}>
        {ad.image_url ? (
          <WmImage
            src={ad.image_url}
            alt={ad.title}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className={styles.image}
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden>
            <TagIcon size={32} />
          </div>
        )}
      </div>

      <div className={styles.body}>
        <span className={styles.badge}>
          <TagIcon size={11} />
          إعلان
        </span>
        <h3 className={styles.title}>{ad.title}</h3>
        {ad.business && (
          <p className={styles.biz}>
            <span>{ad.business.name}</span>
            <ExternalLinkIcon size={12} />
          </p>
        )}
      </div>
    </>
  )

  const className = `${styles.wrap} ${styles[variant]}`

  if (safeLinkUrl) {
    return (
      <Link href={safeLinkUrl} className={className} target="_blank" rel="noopener sponsored">
        {inner}
      </Link>
    )
  }

  if (ad.business?.slug) {
    return (
      <Link href={`/businesses/${ad.business.slug}`} className={className}>
        {inner}
      </Link>
    )
  }

  return <div className={className}>{inner}</div>
}
