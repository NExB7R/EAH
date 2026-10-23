import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeftIcon } from '@/components/icons'
import styles from './panel.module.css'

type Props = {
  title: string
  description?: string
  action?: { label: string; href: string }
  children: ReactNode
  noPadding?: boolean
}

export default function Panel({ title, description, action, children, noPadding }: Props) {
  return (
    <section className={`${styles.panel} ${noPadding ? styles.noPadding : ''}`}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.desc}>{description}</p>}
        </div>
        {action && (
          <Link href={action.href} className={styles.action}>
            <span>{action.label}</span>
            <ArrowLeftIcon size={12} />
          </Link>
        )}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  )
}
