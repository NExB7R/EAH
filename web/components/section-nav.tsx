import Link from 'next/link'
import { NAV_ITEMS } from '@/lib/nav-items'
import styles from './section-nav.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Section Nav (icons row with tooltips)
// يظهر تحت الهيرو في كل صفحات الأقسام
// ═══════════════════════════════════════════════════════════

type Props = { activeKey?: string }

export default function SectionNav({ activeKey }: Props) {
  return (
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
  )
}
