import {
  SparklesIcon,
  TargetIcon,
  CrownGoldIcon,
  AlertIcon,
  FireIcon,
  TrendingUpIcon,
} from './icons'
import styles from './impact-card.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Impact Card (الأثر)
// ═══════════════════════════════════════════════════════════

type ImpactLevel = 'visitor' | 'basic' | 'member' | 'regular'

type Props = {
  score: number
  level: ImpactLevel
  streakDays: number
  wantedLevel: number
  isPremium?: boolean
}

const LEVEL_META: Record<
  ImpactLevel,
  { label: string; next: number; Icon: typeof SparklesIcon; tone: string }
> = {
  visitor: { label: 'زائر', next: 100, Icon: SparklesIcon, tone: 'visitor' },
  basic: { label: 'أساسي', next: 400, Icon: TargetIcon, tone: 'basic' },
  member: { label: 'عضو', next: 800, Icon: TrendingUpIcon, tone: 'member' },
  regular: { label: 'منتظم', next: 1000, Icon: CrownGoldIcon, tone: 'regular' },
}

const WANTED_META = [
  { min: 12, level: 5, emoji: '💀', label: 'خطر' },
  { min: 8, level: 4, emoji: '⭐⭐⭐⭐', label: 'مقيّد' },
  { min: 5, level: 3, emoji: '⭐⭐⭐', label: 'تحذير' },
  { min: 3, level: 2, emoji: '⭐⭐', label: 'مراقبة' },
  { min: 1, level: 1, emoji: '⭐', label: 'ملاحظة' },
] as const

export default function ImpactCard({ score, level, streakDays, wantedLevel }: Props) {
  const meta = LEVEL_META[level]
  const Icon = meta.Icon
  const safeScore = Math.min(1000, Math.max(0, score))
  const progress = Math.min(100, (safeScore / meta.next) * 100)
  const remaining = Math.max(0, meta.next - safeScore)

  const wanted = WANTED_META.find((w) => wantedLevel >= w.min) ?? null

  return (
    <section className={`${styles.card} ${styles[meta.tone]}`} aria-label="الأثر">
      <header className={styles.header}>
        <div className={styles.iconWrap}>
          <Icon size={20} />
        </div>
        <div className={styles.headerText}>
          <span className={styles.label}>الأثر</span>
          <h3 className={styles.level}>{meta.label}</h3>
        </div>
        {streakDays > 0 && (
          <div className={styles.streak}>
            <FireIcon size={14} />
            <span>{streakDays}</span>
          </div>
        )}
      </header>

      <div className={styles.scoreBox}>
        <span className={styles.score}>{safeScore}</span>
        <span className={styles.scoreMax}>/ 1000</span>
      </div>

      <div className={styles.progressWrap}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.progressText}>
          {remaining > 0 ? `فاضل ${remaining} للمستوى التالي` : 'وصلت أعلى مستوى ✨'}
        </p>
      </div>

      {wanted && (
        <div className={styles.wanted}>
          <AlertIcon size={14} />
          <span className={styles.wantedEmoji}>{wanted.emoji}</span>
          <span className={styles.wantedLabel}>{wanted.label}</span>
        </div>
      )}
    </section>
  )
}
