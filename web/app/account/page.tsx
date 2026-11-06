import { getSession } from '@/lib/auth/session';
import { getAccountStats } from '@/lib/data/account';
import { getBadgeCatalogWithStatus } from '@/lib/data/badges';
import styles from './account-dashboard.module.css';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getSession();
  if (!session) return null;

  const stats = await getAccountStats(session.user.id);
  const badges = await getBadgeCatalogWithStatus(session.user.id);

  // استخدام البيانات الحقيقية من الجلسة
  const currentPoints = stats.pointsBalance || 0;
  const trustTier = session.trustTier || 'fel'; // القيمة الافتراضية
  
  // ترجمة المستوى للعربي
  const tierLabels: Record<string, string> = {
    'bade2': 'مبتدئ',
    'mashey': 'نشيط',
    'fel': 'محترف',
    'harif': 'خبير',
    'ostora': 'أسطورة EAH 👑'
  };
  const currentLevel = tierLabels[trustTier] || 'مبتدئ';
  
  // حساب النقاط المطلوبة للمستوى القادم (تقديري)
  const nextLevelPoints = currentPoints + 50; 
  const progressPercent = 100; // لأننا بنعرض النقاط اللي جمعها فعلاً

  const earnedBadges = badges.filter(b => b.earned);

  return (
    <div className={styles.dashboard}>
      <div className={styles.bentoGrid}>
        {/* كارت المستوى */}
        <div className={`${styles.card} ${styles.levelCard} ${styles.fullWidth}`}>
          <div className={styles.cardTitle}>
            <span>⭐</span> مستواك الحالي
          </div>
          <div className={styles.cardValue}>{currentLevel}</div>
          <div style={{ color: '#a0a0a0', fontSize: '14px', marginTop: '8px' }}>
            إجمالي نقاطك: {currentPoints} نقطة
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
          </div>
          <Link href="/account/points-guide" style={{ fontSize: '12px', color: '#C77DFF', textDecoration: 'underline', marginTop: '12px', display: 'inline-block' }}>
            إزاي أزود نقاطي؟
          </Link>
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
          <div className={styles.cardValue}>{session.streakDays || 0}</div>
          <div style={{ color: '#E8C79A', fontSize: '12px', marginTop: '8px' }}>
            دخلت {session.streakDays || 0} أيام ورا بعض!
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
