import type { Metadata } from 'next'
import { getFeaturedBusinesses } from '@/lib/data'
import { getRotationStart } from '@/lib/featured-rotation'
import PageHeader from '@/components/page-header'
import FeaturedShowcase from './featured-showcase'
import styles from './featured.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'المميزون · EAH',
  description: 'كل الأنشطة المميزة في شبين القناطر والقرى حواليها',
}

export default async function FeaturedPage() {
  const all = await getFeaturedBusinesses(60)
  const start = getRotationStart(all.length)

  return (
    <main className={styles.page}>
      <PageHeader title="المميزون" />

      <section className={`eah-section-bg ${styles.section}`}>
        <div className={styles.container}>
          {all.length === 0 ? (
            <div className={styles.empty}>
              <p>لسه مفيش أنشطة مميزة</p>
              <p className={styles.emptyHint}>هنضيف قريب إن شاء الله</p>
            </div>
          ) : (
            <FeaturedShowcase businesses={all} initialStart={start} />
          )}
        </div>
      </section>
    </main>
  )
}
