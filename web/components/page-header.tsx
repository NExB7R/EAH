import Link from 'next/link'
import Logo from './logo'
import { HomeIcon } from './icons'
import styles from './page-header.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Page Header (used across all pages)
// ═══════════════════════════════════════════════════════════

type Props = {
  // لو true → يظهر زرار الرجوع للرئيسية
  showBack?: boolean
  // عنوان اختياري تحت اللوجو
  title?: string
  // عدد اختياري (مثلاً "53 نشاط")
  count?: number
  // محتوى إضافي تحت العنوان (search, filters)
  children?: React.ReactNode
}

export default function PageHeader({
  showBack = true,
  title,
  count,
  children,
}: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        {showBack && (
          <Link href="/" className={styles.back} aria-label="الرئيسية">
            <HomeIcon size={20} />
          </Link>
        )}

        <div className={styles.logoWrap}>
          <Link href="/" aria-label="EAH — الرئيسية">
            <Logo size="sm" variant="full" href={undefined} />
          </Link>
        </div>
      </div>

      {/* السطر النيون */}
      <div className={styles.neonLine} aria-hidden>
        <span className={styles.neonDot} />
      </div>

      {/* العنوان + العدد */}
      {(title || count !== undefined) && (
        <div className={styles.titleRow}>
          {title && <h1 className={styles.title}>{title}</h1>}
          {count !== undefined && (
            <span className={styles.count}>{count} نشاط</span>
          )}
        </div>
      )}

      {/* محتوى إضافي */}
      {children && <div className={styles.extra}>{children}</div>}
    </header>
  )
}
