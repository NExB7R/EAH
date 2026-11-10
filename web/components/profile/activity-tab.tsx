'use client'

import { ClockIcon } from '@/components/icons'
import styles from './profile-tabs.module.css'

export function ActivityTab() {
  return (
    <div className={styles.tabPanel}>
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>
          <ClockIcon size={32} />
        </span>
        <h3 className={styles.emptyTitle}>سجل النشاط</h3>
        <p className={styles.emptyDesc}>
          هيظهر هنا كل حدث أمني أو إداري: تسجيلات الدخول، تغييرات كلمة المرور، تفعيل 2FA، تعديلات
          الملف الشخصي، والعمليات الإدارية الحساسة.
        </p>
        <p className={styles.emptyHint}>
          سيتم تفعيل السجل تلقائيًا بمجرد تفعيل نظام التدقيق في الخطوات القادمة.
        </p>
      </div>
    </div>
  )
}
