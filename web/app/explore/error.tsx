'use client'

import Link from 'next/link'
import { SearchIcon, AlertIcon } from '@/components/icons'
import styles from './error.module.css'

export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <span className={styles.icon} aria-hidden>
          <AlertIcon size={40} />
        </span>
        <h1 className={styles.title}>حصلت مشكلة في البحث</h1>
        <p className={styles.desc}>
          تعذّر تحميل نتائج البحث دلوقتي. جرّب تحدّث الصفحة أو ارجع للصفحة الرئيسية.
        </p>
        {error.digest && <p className={styles.code}>كود الخطأ: {error.digest}</p>}
        <div className={styles.actions}>
          <button type="button" onClick={reset} className={styles.btnPrimary}>
            🔄 حاول تاني
          </button>
          <Link href="/" className={styles.btnSecondary}>
            <SearchIcon size={14} />
            الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
