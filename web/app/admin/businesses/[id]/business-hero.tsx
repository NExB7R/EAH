import Link from 'next/link'
import type { AdminBusiness } from '@/lib/data/admin-business'
import { ExternalLinkIcon, StarIcon } from '@/components/icons'
import { typeLabel, statusOf } from './type-label'
import styles from './business-hero.module.css'

export default function BusinessHero({ biz }: { biz: AdminBusiness }) {
  const coverUrl = biz.cover_image_url ?? null
  const status = statusOf(biz)
  const initial = biz.name.charAt(0)

  const coverStyle = coverUrl
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(168,85,247,0.3), rgba(10,7,20,0.75)), url(${coverUrl})`,
      }
    : undefined

  return (
    <section className={styles.hero}>
      <div className={styles.heroCover} style={coverStyle} />
      <div className={styles.heroBody}>
        <div className={styles.heroLogo}>{initial}</div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>{biz.name}</h1>
          <div className={styles.heroMeta}>
            <span className={`${styles.heroStatus} ${styles[`status_${status.key}`]}`}>
              {status.label}
            </span>
            <span className={styles.dot}>·</span>
            <span>{typeLabel(biz.business_type)}</span>
            {biz.area && (
              <>
                <span className={styles.dot}>·</span>
                <span>{biz.area}</span>
              </>
            )}
            {biz.rating_count > 0 && (
              <>
                <span className={styles.dot}>·</span>
                <span className={styles.heroRating}>
                  <StarIcon size={11} />
                  {biz.rating_avg.toFixed(1)}
                  <span className={styles.heroRatingCount}>({biz.rating_count})</span>
                </span>
              </>
            )}
          </div>
          <Link
            href={`/businesses/${biz.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.heroSlug}
          >
            <span>{biz.slug}</span>
            <ExternalLinkIcon size={10} />
          </Link>
        </div>
      </div>
    </section>
  )
}
