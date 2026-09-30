import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircleIcon, StoreIcon, ArrowLeftIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import styles from './success.module.css'

export const metadata: Metadata = { title: 'تم التسجيل · EAH' }

export default function SuccessPage() {
  return (
    <main className={styles.page}>
      <SecondaryHero showNav={false} />

      <section className={styles.section}>
        <div className={styles.frame}>
          <span className={styles.icon} aria-hidden>
            <CheckCircleIcon size={56} />
          </span>

          <h1 className={styles.title}>تم تسجيل نشاطك ✓</h1>

          <p className={styles.text}>
            اهلاً بيك في عيلة EAH. النشاط هيتم مراجعته خلال 24 ساعة، وهنبلغك أول ما يتفعّل.
          </p>

          <div className={styles.info}>
            <strong>كل حاجة مجانية للأبد</strong>
            <span>صفحتك جاهزة — تقدر تبدأ تستقبل طلبات واتساب فوراً</span>
          </div>

          <div className={styles.actions}>
            <Link href="/merchant" className={styles.btnPrimary}>
              <StoreIcon size={18} />
              <span>افتح لوحة التحكم</span>
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
