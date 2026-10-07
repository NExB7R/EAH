import Link from 'next/link'
import Logo from './logo'
import { HomeIcon } from './icons'
import styles from './page-header.module.css'

type LogoSize = 'sm' | 'md' | 'lg'

type Props = {
  showBack?: boolean
  title?: string
  count?: number
  logoSize?: LogoSize
  /** تقليل الـ top padding (للاستخدام جوه الفوتر) */
  compact?: boolean
  children?: React.ReactNode
}

export default function PageHeader({
  showBack = true,
  title,
  count,
  logoSize = 'sm',
  compact = false,
  children,
}: Props) {
  return (
    <header className={`${styles.header} ${compact ? styles.compact : ''}`}>
      <div className={styles.topRow}>
        {showBack && (
          <Link href="/" className={styles.back} aria-label="الرئيسية">
            <HomeIcon size={20} />
          </Link>
        )}
        <div className={styles.logoWrap}>
          <Link href="/" aria-label="EAH — الرئيسية">
            <Logo size={logoSize} variant="full" href={null} />
          </Link>
        </div>
      </div>

      <div className={styles.neonLine} aria-hidden />

      {(title || count !== undefined) && (
        <div className={styles.titleRow}>
          {title && <h1 className={styles.title}>{title}</h1>}
          {count !== undefined && <span className={styles.count}>{count} نشاط</span>}
        </div>
      )}

      {children && <div className={styles.extra}>{children}</div>}
    </header>
  )
}
