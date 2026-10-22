import { redirect } from 'next/navigation'
import { CrownGoldIcon, SparklesIcon, GiftIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getAccountStats } from '@/lib/data/account'
import AccountPageHeader from '@/components/account-page-header'
import styles from './loyalty.module.css'

export const dynamic = 'force-dynamic'

const TIERS = [
  { key: 'bronze', min: 0, max: 499, label: 'برونزي', multiplier: 1, discount: 0 },
  { key: 'silver', min: 500, max: 1999, label: 'فضي', multiplier: 1.25, discount: 5 },
  { key: 'gold', min: 2000, max: 4999, label: 'ذهبي', multiplier: 1.5, discount: 10 },
  { key: 'platinum', min: 5000, max: 9999, label: 'بلاتيني', multiplier: 2, discount: 15 },
  { key: 'diamond', min: 10000, max: Infinity, label: 'ماسي', multiplier: 3, discount: 25 },
] as const

function getTier(points: number) {
  return TIERS.find((t) => points >= t.min && points <= t.max) ?? TIERS[0]
}

function getNextTier(points: number) {
  return TIERS.find((t) => t.min > points) ?? null
}

export default async function LoyaltyPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/loyalty')

  const stats = await getAccountStats(session.userId)
  const current = getTier(stats.pointsBalance)
  const next = getNextTier(stats.pointsBalance)

  const progress = next
    ? Math.min(
        100,
        Math.round(((stats.pointsBalance - current.min) / (next.min - current.min)) * 100),
      )
    : 100

  const remaining = next ? next.min - stats.pointsBalance : 0

  return (
    <div>
      <AccountPageHeader
        title="مستويات الولاء"
        description={`${stats.pointsBalance} نقطة — مستوى ${current.label}`}
      />

      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <span className={styles.heroBadge}>
          <CrownGoldIcon size={14} />
          المستوى الحالي
        </span>
        <h2 className={styles.heroTitle}>{current.label}</h2>
        <p className={styles.heroPoints}>
          <strong>{stats.pointsBalance.toLocaleString('en-US')}</strong> نقطة
        </p>

        {next && (
          <>
            <div className={styles.progressWrap}>
              <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            </div>
            <p className={styles.progressText}>
              باقي <strong>{remaining.toLocaleString('en-US')}</strong> نقطة للوصول لمستوى{' '}
              <strong>{next.label}</strong>
            </p>
          </>
        )}
      </section>

      <section className={styles.tierSection}>
        <h3 className={styles.sectionTitle}>كل المستويات</h3>
        <div className={styles.tiersGrid}>
          {TIERS.map((tier) => {
            const isCurrent = tier.key === current.key
            const isPast = stats.pointsBalance >= tier.min
            return (
              <div
                key={tier.key}
                className={`${styles.tierCard} ${isCurrent ? styles.tierActive : ''} ${isPast && !isCurrent ? styles.tierPast : ''}`}
              >
                {isCurrent && (
                  <span className={styles.currentBadge}>
                    <SparklesIcon size={11} />
                    أنت هنا
                  </span>
                )}
                <h4 className={styles.tierName}>{tier.label}</h4>
                <p className={styles.tierRange}>
                  {tier.min.toLocaleString('en-US')}
                  {tier.max === Infinity ? '+' : ` - ${tier.max.toLocaleString('en-US')}`}
                </p>
                <ul className={styles.tierPerks}>
                  <li>
                    <GiftIcon size={12} />
                    {tier.multiplier}x نقاط
                  </li>
                  {tier.discount > 0 && (
                    <li>
                      <SparklesIcon size={12} />
                      خصم {tier.discount}% على الإعلانات
                    </li>
                  )}
                </ul>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
