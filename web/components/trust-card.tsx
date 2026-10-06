import { ShieldCheckIcon, FireIcon, SparkleStarIcon } from './icons'
import { TRUST_TIERS, getTrustTier, getTrustTierMeta, trustProgress } from '@/lib/trust'
import styles from './trust-card.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Trust Card (المصداقية)
// 5 مستويات: على البركة → أسطورة
// ═══════════════════════════════════════════════════════════

type Props = {
  score: number
  streakDays: number
  legendPoints?: number
  label?: string
}

export default function TrustCard({
  score,
  streakDays,
  legendPoints = 0,
  label = 'مصداقيتك',
}: Props) {
  const tier = getTrustTier(score)
  const meta = getTrustTierMeta(score)
  const progress = trustProgress(score)
  const isLegend = tier === 'ostora'

  const progressPercent = isLegend ? Math.min(100, (legendPoints / 500) * 100) : progress.percent

  return (
    <section className={`${styles.card} ${styles[tier]}`} aria-label="المصداقية">
      <header className={styles.header}>
        <div className={styles.iconWrap}>
          <ShieldCheckIcon size={20} />
        </div>
        <div className={styles.headerText}>
          <span className={styles.label}>{label}</span>
          <h3 className={styles.tier}>
            <span className={styles.emoji}>{meta.emoji}</span>
            <span>{meta.label}</span>
          </h3>
        </div>
        {streakDays > 0 && (
          <div className={styles.streak}>
            <FireIcon size={14} />
            <span>{streakDays}</span>
          </div>
        )}
      </header>

      <div className={styles.scoreBox}>
        <span className={styles.score}>{Math.round(score)}</span>
        <span className={styles.scoreMax}>/ 100</span>
      </div>

      <div className={styles.progressWrap}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
        {isLegend ? (
          <p className={styles.progressText}>
            <SparkleStarIcon size={12} />
            {legendPoints} نقطة أسطورة
          </p>
        ) : (
          <p className={styles.progressText}>فاضل {progress.remaining} نقطة للمستوى اللي بعده</p>
        )}
      </div>

      <div className={styles.tiersBar} aria-hidden>
        {(Object.keys(TRUST_TIERS) as (keyof typeof TRUST_TIERS)[]).map((k) => (
          <span
            key={k}
            className={`${styles.tierDot} ${k === tier ? styles.tierDotActive : ''}`}
            title={TRUST_TIERS[k].label}
          />
        ))}
      </div>
    </section>
  )
}
