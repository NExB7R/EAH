import type { ComponentType } from 'react'
import Link from 'next/link'
import SecondaryHero from './secondary-hero'
import type { SectionTone } from './section-title'
import type { CardTone } from './business-card'
import { TargetIcon } from './icons'
import LoadMoreGrid from './load-more'
import type { Business } from '@/lib/data'
import styles from './section-layout.module.css'

type IconComp = ComponentType<{ size?: number; className?: string }>

type Props = {
  activeKey: string
  title: string
  Icon: IconComp
  tone: SectionTone
  businesses: Business[]
  pageSize?: number
}

export default function SectionLayout({
  activeKey,
  title,
  Icon,
  tone,
  businesses,
  pageSize = 10,
}: Props) {
  const cardTone: CardTone =
    tone === 'gold'
      ? 'gold'
      : tone === 'orange'
        ? 'orange'
        : tone === 'teal'
          ? 'teal'
          : tone === 'pink'
            ? 'pink'
            : tone === 'blue'
              ? 'blue'
              : 'purple'

  return (
    <main className={styles.page}>
      <SecondaryHero
        activeKey={activeKey}
        title={title}
        Icon={Icon}
        tone={tone}
        count={businesses.length}
      />

      <div className={styles.content}>
        {businesses.length > 0 ? (
          <LoadMoreGrid businesses={businesses} tone={cardTone} pageSize={pageSize} />
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <TargetIcon size={44} />
            </div>
            <h2 className={styles.emptyTitle}>لسه مفيش حاجة هنا</h2>
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
