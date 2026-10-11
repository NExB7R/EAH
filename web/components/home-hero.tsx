import { Suspense } from 'react'
import Logo from './logo'
import HomeSearchForm from './home-search-form'
import CategoryChips from './category-chips'
import { CrownIcon, LocationIcon } from './icons'
import styles from './home-hero.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Home Hero
// ═══════════════════════════════════════════════════════════

type Props = {
  isLoggedIn: boolean
  hasBusiness: boolean
}

export default function HomeHero({ isLoggedIn, hasBusiness }: Props) {
  return (
    <section className={styles.hero} data-logged={isLoggedIn} data-has-biz={hasBusiness}>
      <div className={styles.ambient} aria-hidden />
      <div className={styles.grid} aria-hidden />

      <div className={styles.content}>
        {/* اللوجو */}
        <div className={styles.logoWrap}>
          <Logo size="lg" />
        </div>

        {/* لافتة دولة شبين القناطر — فوق الهوك */}
        <div className={styles.shibinSign}>
          <span className={styles.signIcon} aria-hidden>
            <LocationIcon size={14} />
          </span>
          <span className={styles.signText}>دولة شبين القناطر تتحدث</span>
        </div>

        {/* الهوك — جملة واحدة */}
        <h1 className={styles.hook} elementtiming="hero-h1">
          <span className={styles.hookAccent} data-text="شبيك لبيك">
            شبيك لبيك
          </span>
          <span className={styles.crownWrap} aria-hidden>
            <CrownIcon size={32} />
          </span>
          <span className={styles.hookAccent} data-text="كل حاجة حواليك">
            كل حاجة حواليك
          </span>
        </h1>

        {/* Search */}
        <div className={styles.searchWrap}>
          <HomeSearchForm />
        </div>

        {/* Chips */}
        <div className={styles.chipsWrap}>
          <Suspense fallback={null}>
            <CategoryChips />
          </Suspense>
        </div>
      </div>
    </section>
  )
}
