import Link from 'next/link'
import { ArrowLeftIcon } from '@/components/icons'
import styles from './stat-card.module.css'

type Tone = 'purple' | 'teal' | 'gold' | 'orange'

type Props = {
  icon: React.ComponentType<{ size?: number }>
  label: string
  value: number | string
  hint?: string
  href?: string
  tone?: Tone
}

export default function StatCard({ icon: Icon, label, value, hint, href, tone = 'purple' }: Props) {
  const inner = (
    <>
      <div className={styles.head}>
        <span className={styles.icon}>
          <Icon size={18} />
        </span>
        {href && <ArrowLeftIcon size={13} className={styles.arrow} />}
      </div>
      <span className={styles.value}>
        {typeof value === 'number' ? value.toLocaleString('en-US') : value}
      </span>
      <span className={styles.label}>{label}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </>
  )
  return href ? (
    <Link href={href} className={`${styles.card} ${styles[tone]}`}>
      {inner}
    </Link>
  ) : (
    <div className={`${styles.card} ${styles[tone]}`}>{inner}</div>
  )
}
