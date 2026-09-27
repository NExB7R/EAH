import Link from 'next/link'
import { SparkleStarIcon, SearchIcon, StarIcon, EyeIcon } from './icons'
import styles from './suggested-cta.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Suggested CTA (المرشح لك)
//   • بيشتغل بعد ما المنصة تفهم تفضيلاتك
//   • دلوقتي بيقول: تصفح أنشطة أكتر
// ═══════════════════════════════════════════════════════════

type Props = {
  viewedCount?: number
}

export default function SuggestedCta({ viewedCount = 0 }: Props) {
  const isReady = viewedCount >= 5

  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <div className={styles.glow} aria-hidden />

        <div className={styles.content}>
          <span className={styles.iconWrap} aria-hidden>
            <SparkleStarIcon size={32} />
          </span>

          <h2 className={styles.title}>
            {isReady ? (
              <>
                <span className={styles.accent}>مرشح</span> لك
              </>
            ) : (
              <>
                <span className={styles.accent}>اكتشف</span> أكتر
              </>
            )}
          </h2>

          <p className={styles.sub}>
            {isReady
              ? 'هنجهزلك ترشيحات على مزاجك — قريباً'
              : 'تصفح أنشطة أكتر عشان نعرف تفضيلاتك ونرشحلك الأفضل'}
          </p>

          <div className={styles.pills}>
            <span className={styles.pill}>
              <EyeIcon size={13} />
              <span>شوفت {viewedCount}</span>
            </span>
            <span className={styles.pill}>
              <StarIcon size={13} />
              <span>مفضلات</span>
            </span>
            <span className={styles.pill}>
              <SearchIcon size={13} />
              <span>طلبات</span>
            </span>
          </div>

          <Link href="/explore" className={styles.cta}>
            <span>اكتشف أنشطة أكتر</span>
            <SparkleStarIcon size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
