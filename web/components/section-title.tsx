import type { ComponentType } from 'react'
import styles from './section-title.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Section Title
// عنوان قسم فخم — بديل breadcrumb
// أيقونة + اسم + خط نيون
// ═══════════════════════════════════════════════════════════

type IconComp = ComponentType<{ size?: number; className?: string }>

export type SectionTone = 'gold' | 'orange' | 'purple' | 'teal' | 'pink' | 'blue'

type Props = {
  label: string
  Icon: IconComp
  tone?: SectionTone
  count?: number
  countLabel?: string
}

export default function SectionTitle({
  label,
  Icon,
  tone = 'gold',
  count,
  countLabel,
}: Props) {
  return (
    <div className={`${styles.wrap} ${styles[tone]}`}>
      <span className={styles.iconWrap} aria-hidden>
        <Icon size={26} />
      </span>

      <h1 className={styles.title}>{label}</h1>

      {count !== undefined && (
        <span className={styles.count}>{count} {countLabel ?? "نشاط"}</span>
      )}

      <span className={styles.line} aria-hidden />
    </div>
  )
}
