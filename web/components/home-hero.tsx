import Link from 'next/link'
import Logo from './logo'
import {
  SearchIcon,
  MicIcon,
  UtensilsIcon,
  PillIcon,
  CartIcon,
  BikeIcon,
  SparklesIcon,
  CrownIcon,
  LocationIcon,
  SparkleStarIcon,
} from './icons'
import styles from './home-hero.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Home Hero
// ═══════════════════════════════════════════════════════════

const CATEGORIES = [
  { type: 'restaurant', label: 'مطاعم', Icon: UtensilsIcon, count: 11 },
  { type: 'pharmacy', label: 'صيدليات', Icon: PillIcon, count: 10 },
  { type: 'supermarket', label: 'ماركت', Icon: CartIcon, count: 4 },
  { type: 'delivery_office', label: 'توصيل', Icon: BikeIcon, count: 10 },
  { type: 'misc', label: 'أنشطة أخرى', Icon: SparklesIcon, count: 24 },
]

export default function HomeHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.ambient} aria-hidden />
      <div className={styles.grid} aria-hidden />

      <div className={styles.content}>
        {/* اللوجو */}
        <div className={styles.logoWrap}>
          <Logo size="lg" />
        </div>

        {/* مساحة جمالية */}
        <div className={styles.spacer} aria-hidden />

        {/* لافتة دولة شبين القناطر — فوق الهوك */}
        <div className={styles.shibinSign}>
          <span className={styles.signIcon} aria-hidden>
            <LocationIcon size={14} />
          </span>
          <span className={styles.signText}>دولة شبين القناطر تتحدث</span>
        </div>

        {/* الهوك — جملة واحدة */}
        <h1 className={styles.hook}>
          <span className={styles.hookAccent}>شبيك لبيك</span>
          <span className={styles.crownWrap} aria-hidden>
            <CrownIcon size={32} />
          </span>
          <span className={styles.hookAccent}>كل حاجة حواليك</span>
        </h1>

        {/* Search */}
        <form
          action="/explore"
          method="get"
          className="eah-search-form"
          role="search"
        >
          <div className="eah-search-box">
            <span className="eah-search-icon" aria-hidden>
              <SearchIcon size={20} />
            </span>
            <input
              type="search"
              name="q"
              className="eah-search-input"
              placeholder="دور على مطعم، صيدلية، ماركت..."
              aria-label="البحث"
              autoComplete="off"
              enterKeyHint="search"
            />
            <Link
              href="/explore?voice=1"
              className="eah-icon-action"
              aria-label="بحث صوتي"
              prefetch={false}
              data-tooltip="بحث صوتي"
            >
              <MicIcon size={18} />
            </Link>
            <Link
              href="/explore?suggest=1"
              className="eah-icon-action eah-icon-gold"
              aria-label="رشحلي"
              prefetch={false}
              data-tooltip="رشحلي"
            >
              <SparkleStarIcon size={18} />
            </Link>
          </div>
        </form>

        {/* Categories */}
        <nav className={styles.categories} aria-label="التصنيفات">
          {CATEGORIES.map(({ type, label, Icon, count }) => (
            <Link
              key={type}
              href={`/explore?type=${type}`}
              className={styles.category}
            >
              <span className={styles.categoryIcon} aria-hidden>
                <Icon size={22} />
              </span>
              <span className={styles.categoryLabel}>{label}</span>
              <span className={styles.categoryCount}>{count}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
