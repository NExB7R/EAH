import type { ComponentType } from 'react'
import SecondaryHero from './secondary-hero'
import FeaturedCard from './featured-card'
import type { SectionTone } from './section-title'
import type { Business } from '@/lib/data'
import styles from './section-page.module.css'

type IconComp = ComponentType<{ size?: number; className?: string }>

type Props = {
  title: string
  Icon: IconComp
  tone: SectionTone
  activeKey: string
  businesses: Business[]
  count?: number
}

export default function SectionPage({
  title,
  Icon,
  tone,
  activeKey,
  businesses,
  count,
}: Props) {
  return (
    <main className={styles.page}>
      <SecondaryHero
        activeKey={activeKey}
        title={title}
        Icon={Icon}
        tone={tone}
        count={count}
      />

      <section className={styles.section}>
        {businesses.length === 0 ? (
          <div className={styles.empty}>
            <p>لسه مفيش أنشطة هنا</p>
            <p className={styles.emptyHint}>هنضيف قريب إن شاء الله</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {businesses.map((b) => (
              <FeaturedCard key={b.id} business={b} variant="small" />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
