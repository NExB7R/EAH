import type { Metadata } from 'next'
import { SparkleStarIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import styles from './suggest.module.css'

export const metadata: Metadata = {
  title: 'رشحلى · EAH',
  description: 'ترشيحات على مزاجك',
}

export default function SuggestPage() {
  return (
    <main className={styles.page}>
      <SecondaryHero activeKey="suggest" title="رشحلى" Icon={SparkleStarIcon} tone="blue" />
      <section className={styles.section}>
        <div className={styles.empty}>
          <p>لسه محتاجين نعرفك أكتر</p>
          <p className={styles.emptyHint}>تصفح أنشطة وابدأ رحلتك</p>
        </div>
      </section>
    </main>
  )
}
