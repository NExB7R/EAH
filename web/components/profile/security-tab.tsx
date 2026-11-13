'use client'

import { LockIcon, ShieldCheckIcon } from '@/components/icons'
import { TwoFactorSection } from '@/components/account/two-factor-section'
import type { TwoFactorState } from '@/lib/data/two-factor'
import styles from './profile-tabs.module.css'

type Props = {
  onComingSoon: (feature: string) => void
  twoFactorState: TwoFactorState
}

export function SecurityTab({ onComingSoon, twoFactorState }: Props) {
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

      <TwoFactorSection state={twoFactorState} />

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
