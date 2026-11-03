'use client'

import Link from 'next/link'
import { CHIPS, EXPLORE_CHIP } from '@/lib/chips-config'
import styles from './category-chips.module.css'

// EAH — Home categories are separate from the hero and contain business types only.
export default function CategoryChips() {
  const categories = CHIPS.filter((chip) => chip.group === 'types')

  return (
    <section className={styles.section} aria-labelledby="home-categories-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <h2 id="home-categories-title" className={styles.title}>اكتشف حسب التصنيف</h2>
            <p className={styles.subtitle}>اختار نوع النشاط اللي بتدور عليه</p>
          </div>
          <Link href={EXPLORE_CHIP.href} className={styles.viewAll}>
            استكشف الكل
          </Link>
        </header>

        <div className={styles.grid}>
          {categories.map(({ key, label, Icon }) => (
            <Link key={key} href={`/explore?type=${encodeURIComponent(key)}`} className={styles.category}>
              <span className={styles.iconWrap} aria-hidden="true"><Icon size={22} /></span>
              <span className={styles.label}>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
