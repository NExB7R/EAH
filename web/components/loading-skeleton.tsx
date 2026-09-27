// EAH — Loading Skeleton (sections)
import styles from './loading-skeleton.module.css'

export default function LoadingSkeleton() {
  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.hero} />
      <div className={styles.section}>
        <div className={styles.head} />
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.card} />
          ))}
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.head} />
        <div className={styles.row} />
      </div>
    </div>
  )
}
