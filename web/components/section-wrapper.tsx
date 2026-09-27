import type { ReactNode } from 'react'
import type { SectionTone } from './section-title'
import styles from './section-wrapper.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Section Wrapper
// إطار ملون + padding — بيستخدم في كل صفحات الأقسام
// ═══════════════════════════════════════════════════════════

type Props = {
  tone: SectionTone
  children: ReactNode
}

export default function SectionWrapper({ tone, children }: Props) {
  return (
    <section className={styles.section}>
      <div className={`${styles.frame} ${styles[tone]}`}>{children}</div>
    </section>
  )
}
