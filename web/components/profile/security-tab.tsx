'use client'

import { LockIcon, ShieldCheckIcon } from '@/components/icons'
import styles from './profile-tabs.module.css'

type Props = {
  onComingSoon: (feature: string) => void
}

export function SecurityTab({ onComingSoon }: Props) {
  return (
    <div className={styles.tabPanel}>
      <div className={styles.panelCard}>
        <div className={styles.panelHead}>
          <span className={styles.panelIcon}>
            <LockIcon size={18} />
          </span>
          <div>
            <h3 className={styles.panelTitle}>كلمة المرور</h3>
            <p className={styles.panelDesc}>غيّر كلمة المرور بشكل دوري لحماية حسابك</p>
          </div>
        </div>
        <button
          type="button"
          className={styles.panelBtn}
          onClick={() => onComingSoon('تغيير كلمة المرور')}
        >
          تغيير كلمة المرور
        </button>
      </div>

      <div className={styles.panelCard}>
        <div className={styles.panelHead}>
          <span className={styles.panelIcon}>
            <ShieldCheckIcon size={18} />
          </span>
          <div>
            <h3 className={styles.panelTitle}>المصادقة الثنائية (2FA)</h3>
            <p className={styles.panelDesc}>
              طبقة حماية إضافية بجانب كلمة المرور — إجبارية لحسابات الإدارة
            </p>
          </div>
        </div>
        <button
          type="button"
          className={`${styles.panelBtn} ${styles.panelBtnPrimary}`}
          onClick={() => onComingSoon('المصادقة الثنائية')}
        >
          تفعيل 2FA
        </button>
      </div>

      <div className={styles.panelCard}>
        <div className={styles.panelHead}>
          <span className={styles.panelIcon}>
            <ShieldCheckIcon size={18} />
          </span>
          <div>
            <h3 className={styles.panelTitle}>الجلسات النشطة</h3>
            <p className={styles.panelDesc}>
              راجع الأجهزة التي سجلت الدخول منها وأنهِ أي جلسة مشبوهة
            </p>
          </div>
        </div>
        <button
          type="button"
          className={styles.panelBtn}
          onClick={() => onComingSoon('الجلسات النشطة')}
        >
          عرض الجلسات
        </button>
      </div>
    </div>
  )
}
