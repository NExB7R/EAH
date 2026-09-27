import Link from 'next/link'
import Logo from './logo'
import { NAV_ITEMS } from '@/lib/nav-items'
import styles from './secondary-hero.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Secondary Hero
// لوجو + سلوغان + خط نيون + تنقل أيقوني
// يظهر في كل الصفحات (ما عدا Home)
// ═══════════════════════════════════════════════════════════

type Props = {
  activeKey?: string
}

export default function SecondaryHero({ activeKey }: Props) {
  return (
    <section className={styles.hero}>
      <div className={styles.logoWrap}>
        <Link href="/" aria-label="EAH — الرئيسية">
          <Logo size="md" />
        </Link>
      </div>

      <div className={styles.neonLine} aria-hidden />

      <nav className={styles.nav} aria-label="التنقل بين الأقسام">
        {NAV_ITEMS.map(({ key, href, label, hint, Icon, enabled }) => {
          const active = key === activeKey

          if (!enabled) {
            return (
              <span
                key={key}
                className={`${styles.item} ${styles.disabled}`}
                aria-disabled="true"
              >
                <Icon size={20} />
                <span className={styles.tip}>{label} — قريباً</span>
              </span>
            )
          }

          return (
            <Link
              key={key}
              href={href}
              className={`${styles.item} ${active ? styles.active : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={20} />
              <span className={styles.tip}>{hint}</span>
            </Link>
          )
        })}
      </nav>
    </section>
  )
}
