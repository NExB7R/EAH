import Link from 'next/link'
import {
  CompassIcon,
  SearchIcon,
  TargetIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from './icons'
import styles from './discovery-cta.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Discovery CTA (Home)
// بلوك يودّي على /explore بروح بنفسجية
// ═══════════════════════════════════════════════════════════

export default function DiscoveryCta() {
  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <div className={styles.glow} aria-hidden />

        <div className={styles.content}>
          <span className={styles.iconWrap} aria-hidden>
            <CompassIcon size={32} />
          </span>

          <h2 className={styles.title}>
            <span className={styles.titleAccent}>اكتشف</span> اللي نفسك فيه
          </h2>

          <p className={styles.sub}>
            بحث ذكي باللهجة المصرية، فلاتر على مزاجك، وترتيب يناسبك
          </p>

          <div className={styles.pills}>
            <span className={styles.pill}>
              <SearchIcon size={13} />
              <span>بحث ذكي</span>
            </span>
            <span className={styles.pill}>
              <TargetIcon size={13} />
              <span>فلاتر متقدمة</span>
            </span>
            <span className={styles.pill}>
              <SparklesIcon size={13} />
              <span>ترتيب مرن</span>
            </span>
          </div>

          <Link href="/explore" className={styles.cta}>
            <span>افتح الاستكشاف</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
