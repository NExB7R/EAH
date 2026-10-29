import Link from 'next/link'
import SecondaryHero from './secondary-hero'
import styles from './legal-page.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Legal Page (موحّد للشروط + الخصوصية + الكوكيز)
// ═══════════════════════════════════════════════════════════

export type LegalSection = {
  title: string
  body: string[]
}

type Props = {
  title: string
  activeKey: string
  updated: string
  intro?: string
  sections: LegalSection[]
}

export default function LegalPage({ title, activeKey, updated, intro, sections }: Props) {
  return (
    <main className={styles.page}>
      <SecondaryHero title={title} activeKey={activeKey} />

      <article className={styles.container}>
        <div className={styles.meta}>
          <span className={styles.badge}>آخر تحديث: {updated}</span>
        </div>

        {intro && <p className={styles.intro}>{intro}</p>}

        <div className={styles.sections}>
          {sections.map((s, i) => (
            <section key={s.title} className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </h2>
              <div className={styles.body}>
                {s.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className={styles.footer}>
          <p>
            لأي استفسار قانوني: <Link href="/contact">صفحة التواصل الرسمية</Link>
          </p>
          <p className={styles.copyright}>© 2026 EAH — كل الحقوق محفوظة</p>
        </footer>
      </article>
    </main>
  )
}
