import type { ReactNode } from 'react'
import styles from './account-page-header.module.css'

type Props = {
  title: string
  description?: string
  children?: ReactNode
}

export default function AccountPageHeader({ title, description, children }: Props) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.desc}>{description}</p>}
      {children}
    </header>
  )
}
