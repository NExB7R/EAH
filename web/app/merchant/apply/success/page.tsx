import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircleIcon, StoreIcon, ArrowLeftIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import styles from './success.module.css'

export const metadata: Metadata = { title: 'طلب النشاط قيد المراجعة · EAH' }

export default function SuccessPage() {
  return (
    <main className={styles.page}>
      <SecondaryHero showNav={false} />

      <section className={styles.section}>
        <div className={styles.frame}>
          <span className={styles.icon} aria-hidden>
            <CheckCircleIcon size={56} />
          </span>

          <h1 className={styles.title}>طلبك وصل للإدارة ✓</h1>

          <p className={styles.text}>
            شكرًا ليك. النشاط دلوقتي تحت مراجعة الإدارة، ومش هيظهر للزوار إلا بعد الموافقة. تقدر تتابع حالة طلبك من لوحة البايع.
          </p>

          <div className={styles.info}>
            <strong>الخطوة الجاية</strong>
            <span>بعد الموافقة، راجع صفحة النشاط واستكمل صورها وبياناتها قبل مشاركة الرابط.</span>
          </div>

          <div className={styles.actions}>
            <Link href="/merchant" className={styles.btnPrimary}>
              <StoreIcon size={18} />
              <span>افتح لوحة البايع</span>
            </Link>
            <Link href="/" className={styles.btnGhost}>
              <span>رجوع للرئيسية</span>
              <ArrowLeftIcon size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
