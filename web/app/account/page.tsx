import { getSession } from '@/lib/auth/session';
import { getAccountStats } from '@/lib/data/account';
import { getBadgeCatalogWithStatus } from '@/lib/data/badges';
import styles from './account-dashboard.module.css';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getSession();
  if (!session) return null;

  const stats = await getAccountStats(session.user.id);
  const badges = await getBadgeCatalogWithStatus(session.user.id);

  // حساب المستوى الحالي (نظام مؤقت للعرض)
  const currentPoints = stats.pointsBalance || 0;
  const nextLevelPoints = 150;
  const progressPercent = Math.min((currentPoints / nextLevelPoints) * 100, 100);
  
  // شارات مكتسبة
  const earnedBadges = badges.filter(b => b.earned);

  return (
    <div className={styles.dashboard}>
      <div className={styles.bentoGrid}>
        {/* كارت المستوى */}
        <div className={`${styles.card} ${styles.levelCard} ${styles.fullWidth}`}>
          <div className={styles.cardTitle}>
            <span>⭐</span> مستواك الحالي
          </div>
          <div className={styles.cardValue}>نشيط</div>
          <div style={{ color: '#a0a0a0', fontSize: '14px', marginTop: '8px' }}>
            فاضلك {nextLevelPoints - currentPoints} نقطة توصل لـ "محترف"
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* كارت النقاط */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>💎</span> إجمالي النقاط
          </div>
          <div className={styles.cardValue}>{currentPoints}</div>
        </div>

        {/* كارت التتابع */}
        <div className={`${styles.card} ${styles.streakCard}`}>
          <div className={styles.cardTitle}>
            <span>🔥</span> أيام متتالية
          </div>
          <div className={styles.cardValue}>3</div>
          <div style={{ color: '#E8C79A', fontSize: '12px', marginTop: '8px' }}>
            كمل 4 أيام وخد شارة "الوفي"
          </div>
        </div>

        {/* كارت الشارات */}
        <div className={`${styles.card} ${styles.fullWidth}`}>
          <div className={styles.cardTitle}>
            <span>🏆</span> شاراتك
          </div>
          <div className={styles.badgesGrid}>
            {earnedBadges.length > 0 ? (
              earnedBadges.map(b => (
                <div key={b.key} className={styles.badgeItem}>
                  <span>{b.icon}</span>
                  <span className={styles.badgeLabel}>{b.label}</span>
                </div>
              ))
            ) : (
              <div style={{ color: '#a0a0a0', fontSize: '14px' }}>لسه مفيش شارات. ابدأ قيم الأنشطة!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
