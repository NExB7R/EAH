'use client'

import { ClockIcon, CheckCircleIcon, CloseIcon } from '@/components/icons'
import { useBusinessForm } from '../business-form-context'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

export default function StatusSection() {
  const ctx = useBusinessForm()
  return (
    <>
      <p className={styles.hint}>
        الحالة تتحدد تلقائياً من مواعيد العمل. لو عايز تقفل النشاط مؤقتاً أو تفتحه يدوي — غيّر من
        هنا.
      </p>
      <div className={styles.field}>
        <label className={styles.label}>حالة الفتح الآن</label>
        <div className={styles.typeGrid}>
          <button
            type="button"
            className={`${styles.typeCard} ${ctx.openNowOverride === 'auto' ? styles.typeCardActive : ''}`}
            onClick={() => ctx.setOpenNowOverride('auto')}
          >
            <ClockIcon size={18} />
            <span>تلقائي (من الساعات)</span>
          </button>
          <button
            type="button"
            className={`${styles.typeCard} ${ctx.openNowOverride === 'open' ? styles.typeCardActive : ''}`}
            onClick={() => ctx.setOpenNowOverride('open')}
          >
            <CheckCircleIcon size={18} />
            <span>مفتوح الآن</span>
          </button>
          <button
            type="button"
            className={`${styles.typeCard} ${ctx.openNowOverride === 'closed' ? styles.typeCardActive : ''}`}
            onClick={() => ctx.setOpenNowOverride('closed')}
          >
            <CloseIcon size={18} />
            <span>مغلق مؤقتاً</span>
          </button>
        </div>
      </div>
      <SaveBar
        onClick={ctx.saveOpenOverride}
        pending={ctx.pending}
        saved={ctx.savedSection === 'status'}
      />
    </>
  )
}
