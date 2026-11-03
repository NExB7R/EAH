import Logo from './logo'
import HomeSearchForm from './home-search-form'
import { CrownIcon, LocationIcon } from './icons'
import { getAppTexts } from '@/lib/data/app-texts'
import styles from './home-hero.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Home Hero
// ═══════════════════════════════════════════════════════════

type Props = {
  isLoggedIn: boolean
  hasBusiness: boolean
}

export default async function HomeHero({ isLoggedIn, hasBusiness }: Props) {
  const texts = await getAppTexts()
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
          <span className={styles.signText}>{texts.hero_sign}</span>
        </div>

        {/* الهوك — جملة واحدة */}
        <h1 className={styles.hook} elementtiming="hero-h1">
          <span className={styles.hookAccent} data-text={texts.hero_hook_line_1}>
            {texts.hero_hook_line_1}
          </span>
          <span className={styles.crownWrap} aria-hidden>
            <CrownIcon size={32} />
          </span>
          <span className={styles.hookAccent} data-text={texts.hero_hook_line_2}>
            {texts.hero_hook_line_2}
          </span>
        </h1>

        {/* Search */}
        <div className={styles.searchWrap}>
          <HomeSearchForm />
        </div>

      </div>
    </section>
  )
}
