import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/data/user'
import { getBadgeCatalogWithStatus } from '@/lib/data/badges'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { CrownGoldIcon } from '@/components/icons'
import styles from './badges.module.css'

export const dynamic = 'force-dynamic'

const CATEGORY_LABEL: Record<string, string> = {
  achievement: 'إنجازات',
  quality: 'جودة',
  consistency: 'استمرارية',
  social: 'تفاعل',
  special: 'خاصة',
}

const CATEGORY_ORDER = ['achievement', 'consistency', 'quality', 'social', 'special']

export default async function BadgesPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/badges')

  const badges = await getBadgeCatalogWithStatus(session.userId)
  const earned = badges.filter((b) => b.earned)
  const locked = badges.filter((b) => !b.earned)
  const progress = badges.length > 0 ? Math.round((earned.length / badges.length) * 100) : 0

  // Group by category
  const grouped = new Map<string, typeof badges>()
  for (const b of badges) {
    if (!grouped.has(b.category)) grouped.set(b.category, [])
    grouped.get(b.category)!.push(b)
  }

  return (
    <div>
      <AccountPageHeader
        title="شاراتك"
        description={`${earned.length} من ${badges.length} — أكمل إنجازاتك`}
      />

      {/* Progress */}
      <div className={styles.progressCard}>
        <div className={styles.progressHead}>
          <span className={styles.progressLabel}>التقدم الكلي</span>
          <span className={styles.progressPct}>{progress}%</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {badges.length === 0 ? (
        <EmptyState
          Icon={CrownGoldIcon}
          title="مفيش شارات لسه"
          description="أكمل تفاعلاتك عشان تفتح الشارات"
        />
      ) : (
        CATEGORY_ORDER.filter((c) => grouped.has(c)).map((cat) => (
          <section key={cat} className={styles.section}>
            <h2 className={styles.sectionTitle}>{CATEGORY_LABEL[cat] ?? cat}</h2>
            <div className={styles.grid}>
              {grouped.get(cat)!.map((b) => (
                <article
                  key={b.key}
                  className={`${styles.badge} ${b.earned ? styles.badgeEarned : styles.badgeLocked}`}
                >
                  <span className={styles.badgeIcon}>{b.icon}</span>
                  <div className={styles.badgeBody}>
                    <span className={styles.badgeLabel}>{b.label}</span>
                    <span className={styles.badgeDesc}>{b.description}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}

      {locked.length > 0 && (
        <p className={styles.footer}>
          🔒 عندك {locked.length} شارة مقفولة — كمّل تفاعلك عشان تفتحها
        </p>
      )}
    </div>
  )
}
