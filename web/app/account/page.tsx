import { getUserSession } from '@/lib/data/user'
import { getAccountStats } from '@/lib/data/account'
import { getBadgeCatalogWithStatus } from '@/lib/data/badges'
import styles from './account-dashboard.module.css'
import Link from 'next/link'
import { ProfileHeader } from '@/components/profile/profile-header'
import type { BadgeKind, ProfileRole } from '@/lib/profile/role-theme'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const session = await getUserSession()
  if (!session) return null

  const stats = await getAccountStats(session.userId)
  const badges = await getBadgeCatalogWithStatus(session.userId)

  const currentPoints = stats.pointsBalance || 0
  const trustTier = session.trustTier || 'fel'
  const streakDays = session.streakDays || 0

  const tierLabels: Record<string, string> = {
    bade2: 'مبتدئ',
    mashey: 'نشيط',
    fel: 'محترف',
    harif: 'خبير',
    ostora: 'أسطورة EAH 👑',
  }
  const currentLevel = tierLabels[trustTier] || 'مبتدئ'

  // Progress toward next tier (rough thresholds)
  const tierThresholds: Record<string, number> = {
    bade2: 50,
    mashey: 150,
    fel: 300,
    harif: 600,
    ostora: 1000,
  }
  const nextThreshold = tierThresholds[trustTier] || 150
  const progressPercent = Math.min((currentPoints / nextThreshold) * 100, 100)

  const earnedBadges = badges.filter((b) => b.earned)

  const primaryRole: ProfileRole =
    session.role === 'super_admin'
      ? 'super_admin'
      : session.role === 'merchant'
        ? 'merchant'
        : session.hasActiveAds
          ? 'advertiser'
          : 'customer'

  const headerBadges: BadgeKind[] = []
  if (session.isVerified) headerBadges.push('verified')
  if (session.isPaidMember) headerBadges.push('premium')
  if (session.hasActiveAds && primaryRole !== 'advertiser') headerBadges.push('advertiser')

  return (
    <div className={styles.dashboard}>
      <ProfileHeader
        displayName={session.displayName}
        avatarUrl={session.avatarUrl}
        role={primaryRole}
        subtitle={
          currentPoints > 0
            ? `عندك ${currentPoints} نقطة — كمّل كده!`
            : 'ابدأ قيم الأنشطة واكسب نقاطك الأولى'
        }
        badges={headerBadges}
      />

      <div className={styles.bentoGrid}>
        {/* Level Card */}
        <div className={`${styles.card} ${styles.levelCard} ${styles.fullWidth}`}>
          <div className={styles.cardTitle}>
            <span>⭐</span> مستواك الحالي
          </div>
          <div className={styles.cardValue}>{currentLevel}</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
          </div>
          <Link href="/account/points-guide" className={styles.levelLink}>
            إزاي أزود نقاطي؟ ←
          </Link>
        </div>

        {/* Points Card */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>💎</span> إجمالي النقاط
          </div>
          <div className={styles.cardValue}>{currentPoints}</div>
        </div>

        {/* Streak Card */}
        <div className={`${styles.card} ${styles.streakCard}`}>
          <div className={styles.cardTitle}>
            <span>🔥</span> أيام متتالية
          </div>
          <div className={styles.cardValue}>{streakDays}</div>
          <div className={styles.streakHint}>
            {streakDays > 0
              ? `دخلت ${streakDays} ${streakDays === 1 ? 'يوم' : 'أيام'} ورا بعض!`
              : 'دخل النهاردة وابدأ سلسلتك'}
          </div>
        </div>

        {/* Badges */}
        <div className={`${styles.card} ${styles.fullWidth}`}>
          <div className={styles.cardTitle}>
            <span>🏆</span> شاراتك
          </div>
          <div className={styles.badgesGrid}>
            {earnedBadges.length > 0 ? (
              earnedBadges.map((b) => (
                <div key={b.key} className={styles.badgeItem} title={b.description}>
                  <span>{b.icon}</span>
                  <span className={styles.badgeLabel}>{b.label}</span>
                </div>
              ))
            ) : (
              <div className={styles.badgeEmpty}>لسه مفيش شارات — ابدأ قيم الأنشطة!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
