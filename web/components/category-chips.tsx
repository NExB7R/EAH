'use client'

import Link from 'next/link'
import { CHIPS, EXPLORE_CHIP } from '@/lib/chips-config'
import styles from './category-chips.module.css'

// Home categories are business types only. Discovery and feature filters stay separate.
export default function CategoryChips() {
  const categories = CHIPS.filter(
    (chip) => chip.group === 'types' && chip.action.type === 'filter',
  )

  return (
    <section className={styles.section} aria-labelledby="home-categories-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <h2 id="home-categories-title" className={styles.title}>
              اكتشف حسب التصنيف
            </h2>
            <p className={styles.subtitle}>اختار نوع النشاط اللي بتدور عليه</p>
          </div>
          <Link href={EXPLORE_CHIP.href} className={styles.viewAll}>
            استكشف الكل
          </Link>
        </header>

        <nav className={styles.grid} aria-label="تصنيفات الأنشطة">
          {categories.map((chip) => (
            <Link
              key={chip.key}
              href={`/explore?type=${encodeURIComponent(chip.action.value)}`}
              className={styles.category}
            >
              <span className={styles.iconWrap} aria-hidden="true">
                <chip.Icon size={22} />
              </span>
              <span className={styles.label}>{chip.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
