'use client'

import Link from 'next/link'
import { StoreIcon, AlertIcon } from '@/components/icons'
import styles from './error.module.css'

export default function BusinessError({
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
        <h1 className={styles.title}>تعذّر تحميل النشاط</h1>
        <p className={styles.desc}>
          النشاط غير متاح مؤقتًا أو حصلت مشكلة في التحميل. جرّب تحدّث الصفحة أو اكتشف أنشطة تانية.
        </p>
        {error.digest && <p className={styles.code}>كود الخطأ: {error.digest}</p>}
        <div className={styles.actions}>
          <button type="button" onClick={reset} className={styles.btnPrimary}>
            🔄 حاول تاني
          </button>
          <Link href="/explore" className={styles.btnSecondary}>
            <StoreIcon size={14} />
            اكتشف أنشطة
          </Link>
        </div>
      </div>
    </div>
  )
}
