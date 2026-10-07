import Link from 'next/link'
import Logo from './logo'
import HomeSearchForm from './home-search-form'
import {
  UtensilsIcon,
  PillIcon,
  CartIcon,
  BikeIcon,
  SparklesIcon,
  CrownIcon,
  LocationIcon,
} from './icons'
import styles from './home-hero.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Home Hero
// ═══════════════════════════════════════════════════════════

const CATEGORIES = [
  { type: 'restaurant', label: 'مطاعم', Icon: UtensilsIcon },
  { type: 'pharmacy', label: 'صيدليات', Icon: PillIcon },
  { type: 'supermarket', label: 'ماركت', Icon: CartIcon },
  { type: 'delivery_office', label: 'توصيل', Icon: BikeIcon },
  { type: 'misc', label: 'أنشطة أخرى', Icon: SparklesIcon },
]

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
        <HomeSearchForm />

        {/* Categories */}
        <nav className={styles.categories} aria-label="التصنيفات">
          {CATEGORIES.map(({ type, label, Icon }) => (
            <Link key={type} href={`/explore?type=${type}`} className={styles.category}>
              <span className={styles.categoryIcon} aria-hidden>
                <Icon size={22} />
              </span>
              <span className={styles.categoryLabel}>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
