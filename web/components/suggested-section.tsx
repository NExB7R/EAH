import Link from 'next/link'
import { SparkleStarIcon, ArrowLeftIcon } from './icons'
import styles from './suggested-section.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Suggested Section (المرشح لك)
//   • جديد: بيقول "لسه محتاجين نعرفك أكتر"
//   • بعد كده: هيعرض أنشطة مرشحة فعلية
// ═══════════════════════════════════════════════════════════

export default function SuggestedSection() {
  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}>
              <SparkleStarIcon size={22} />
            </span>
            <h2 className={styles.title}>رشحلى</h2>
          </div>
        </header>

        <div className={styles.neonLine} aria-hidden />

        <div className={styles.body}>
          <span className={styles.bigIcon} aria-hidden>
            <SparkleStarIcon size={40} />
          </span>

          <p className={styles.text}>لسه محتاجين نعرفك أكتر — تصفح أنشطة وابدأ رحلتك</p>

          <Link href="/explore" className={styles.cta}>
            <span>اكتشف أنشطة</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
