import Link from 'next/link'
import { SearchIcon, ArrowLeftIcon } from '@/components/icons'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>الصفحة مش موجودة</h1>
        <p className={styles.text}>
          يمكن الرابط قديم أو الصفحة اتنقلت. جرّب ترجع للرئيسية أو تدور على اللي محتاجه.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primaryBtn}>
            <ArrowLeftIcon size={16} />
            <span>الرئيسية</span>
          </Link>
          <Link href="/explore" className={styles.ghostBtn}>
            <SearchIcon size={16} />
            <span>اكتشف أنشطة</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
