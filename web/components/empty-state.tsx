import Link from 'next/link'
import type { ComponentType } from 'react'
import styles from './empty-state.module.css'

type IconComp = ComponentType<{ size?: number; className?: string }>

type Props = {
  Icon: IconComp
  title: string
  description?: string
  ctaHref?: string
  ctaLabel?: string
}

export default function EmptyState({ Icon, title, description, ctaHref, ctaLabel }: Props) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon} aria-hidden>
        <Icon size={36} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.desc}>{description}</p>}
      {ctaHref && ctaLabel && (
        <Link href={ctaHref} className={styles.cta}>
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
