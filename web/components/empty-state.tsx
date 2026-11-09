import Link from 'next/link'
import type { ComponentType } from 'react'
import styles from './empty-state.module.css'

type IconComp = ComponentType<{ size?: number; className?: string }>

type Variant = 'default' | 'warning' | 'success' | 'info'

type Props = {
  Icon: IconComp
  title: string
  description?: string
  ctaHref?: string
  ctaLabel?: string
  /** Optional secondary action (e.g. "مسح الفلاتر") */
  secondaryCtaHref?: string
  secondaryCtaLabel?: string
  /** Visual variant (default = purple, warning = gold, success = teal, info = blue) */
  variant?: Variant
}

export default function EmptyState({
  Icon,
  title,
  description,
  ctaHref,
  ctaLabel,
  secondaryCtaHref,
  secondaryCtaLabel,
  variant = 'default',
}: Props) {
  return (
    <div className={`${styles.wrap} ${styles[`wrap-${variant}`]}`}>
      <span className={`${styles.icon} ${styles[`icon-${variant}`]}`} aria-hidden>
        <Icon size={40} />
        <span className={styles.iconGlow} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.desc}>{description}</p>}
      {(ctaHref || secondaryCtaHref) && (
        <div className={styles.actions}>
          {ctaHref && ctaLabel && (
            <Link href={ctaHref} className={`${styles.cta} ${styles[`cta-${variant}`]}`}>
              {ctaLabel}
            </Link>
          )}
          {secondaryCtaHref && secondaryCtaLabel && (
            <Link href={secondaryCtaHref} className={styles.ctaSecondary}>
              {secondaryCtaLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
