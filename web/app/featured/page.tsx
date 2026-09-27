import type { Metadata } from 'next'
import { getFeaturedBusinesses } from '@/lib/data'
import { CrownGoldIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import FeaturedShowcase from './featured-showcase'
import styles from './featured.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'المميزون · EAH',
  description: 'الأنشطة المميزة في شبين القناطر والقرى حواليها',
}

export default async function FeaturedPage() {
  const all = await getFeaturedBusinesses(200)

  return (
    <main className={styles.page}>
      <SecondaryHero
        activeKey="featured"
        title="المميزون"
        Icon={CrownGoldIcon}
        tone="gold"
        count={all.length > 0 ? all.length : undefined}
      />

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
