import { TRUST_EVENTS } from '@/lib/trust';
import styles from './points-guide.module.css';

export default function PointsGuide() {
  const earnEvents = Object.entries(TRUST_EVENTS).filter(([_, v]) => v.delta > 0);
  const penaltyEvents = Object.entries(TRUST_EVENTS).filter(([_, v]) => v.delta < 0);

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2 className={styles.title}>🌟 إزاي تكسب نقاط وثقة؟</h2>
        <div className={styles.grid}>
          {earnEvents.map(([key, event]) => (
            <div key={key} className={styles.ruleCard}>
              <span className={styles.icon}>{event.icon}</span>
              <div className={styles.details}>
                <span className={styles.label}>{event.label}</span>
                <span className={styles.points}>+{event.delta} نقطة</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.section} ${styles.dangerSection}`}>
        <h2 className={styles.title}>⚠️ إيه اللي بيقلل الثقة أو النقاط؟ (عشان نحمي المنصة)</h2>
        <p className={styles.subtitle}>المنصة بتحمي التجار والعملاء من التلاعب والإساءة. أي مخالفة هتتخصم من نقاطك أو ثقتك.</p>
        <div className={styles.grid}>
          {penaltyEvents.map(([key, event]) => (
            <div key={key} className={`${styles.ruleCard} ${styles.dangerCard}`}>
              <span className={styles.icon}>{event.icon}</span>
              <div className={styles.details}>
                <span className={styles.label}>{event.label}</span>
                <span className={styles.points}>{event.delta} نقطة</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
