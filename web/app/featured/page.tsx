import type { Metadata } from 'next'
import Link from 'next/link'
import { getFeaturedBusinesses } from '@/lib/data'
import { CrownGoldIcon, TargetIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import LoadMoreGrid from '@/components/load-more'
import styles from './featured.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  'المميزون',
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
        count={all.length}
      />

      <div className={styles.content}>
        {all.length > 0 ? (
          <LoadMoreGrid businesses={all} tone="gold" pageSize={10} />
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <TargetIcon size={44} />
            </div>
            <h2 className={styles.emptyTitle}>لسه مفيش أنشطة مميزة</h2>
            <p className={styles.emptyText}>هنضيف قريب إن شاء الله.</p>
            <Link href="/explore" className={styles.emptyBtn}>
              اكتشف كل حاجة
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
