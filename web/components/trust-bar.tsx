import styles from './trust-bar.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Trust Bar (2026-11-09)
// 4 مؤشرات ثقة حقيقية تحت الهيرو — بدون JS، Server Component
// ═══════════════════════════════════════════════════════════

const BADGES = [
  {
    icon: '🔒',
    label: 'أرقام محمية',
    desc: 'خصوصيتك أولويتنا',
  },
  {
    icon: '✅',
    label: 'تقييمات موثقة',
    desc: 'من عملاء حقيقيين',
  },
  {
    icon: '🎯',
    label: 'تواصل مباشر',
    desc: 'بدون وسيط',
  },
  {
    icon: '💰',
    label: 'بدون عمولة',
    desc: 'على التاجر أو العميل',
  },
]

export default function TrustBar() {
  return (
    <section className={styles.wrap} aria-label="مزايا المنصة">
      <ul className={styles.list}>
        {BADGES.map((b) => (
          <li key={b.label} className={styles.item}>
            <span className={styles.icon} aria-hidden>
              {b.icon}
            </span>
            <div className={styles.body}>
              <span className={styles.label}>{b.label}</span>
              <span className={styles.desc}>{b.desc}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
