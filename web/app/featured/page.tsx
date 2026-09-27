import type { Metadata } from 'next'
import Link from 'next/link'
import { getFeaturedBusinesses } from '@/lib/data'
import { CrownGoldIcon, HomeIcon, ChevronLeftIcon } from '@/components/icons'
import Logo from '@/components/logo'
import FeaturedShowcase from './featured-showcase'
import styles from './featured.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'المميزون · EAH',
  description: 'كل الأنشطة المميزة في شبين القناطر والقرى حواليها',
}

export default async function FeaturedPage() {
  const all = await getFeaturedBusinesses(60)

  return (
    <main className={styles.page}>
      {/* ─── Hero Band ─── */}
      <section className={styles.band}>
        <div className={styles.bandGlow} aria-hidden />

        <div className={styles.head}>
          <div className={styles.logoWrap}>
            <Logo size="md" />
          </div>

          <nav className={styles.breadcrumb} aria-label="مسار التنقل">
            <Link href="/" className={styles.crumb}>
              <HomeIcon size={13} />
              <span>الرئيسية</span>
            </Link>
            <ChevronLeftIcon size={12} className={styles.crumbSep} />
            <span className={styles.crumbNow}>
              <CrownGoldIcon size={13} />
              <span>المميزون</span>
            </span>
          </nav>

          <h1 className={styles.title}>
            <span className={styles.titleAccent}>المميزون</span>
          </h1>

          {all.length > 0 && (
            <span className={styles.meta}>
              <span className={styles.metaDot} />
              {all.length} نشاط مميز
            </span>
          )}
        </div>
      </section>

      {/* ─── Showcase ─── */}
      <section className={styles.section}>
        <div className={styles.frame}>
          {all.length === 0 ? (
            <div className={styles.empty}>
              <p>لسه مفيش أنشطة مميزة</p>
              <p className={styles.emptyHint}>هنضيف قريب إن شاء الله</p>
            </div>
          ) : (
            <FeaturedShowcase businesses={all} />
          )}
        </div>
      </section>
    </main>
  )
}
