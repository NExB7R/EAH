'use client'

import { useBusinessForm } from '../business-form-context'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

export default function NoticeSection() {
  const ctx = useBusinessForm()
  return (
    <>
      <div className={styles.field}>
        <label className={styles.label}>ملحوظة هامة</label>
        <textarea
          value={ctx.importantNotice}
          onChange={(e) => ctx.setImportantNotice(e.target.value)}
          rows={3}
          maxLength={500}
          className={styles.textarea}
          dir="rtl"
          placeholder="رسالة عاجلة تظهر للزوار (مثلاً: إغلاق مؤقت للطوارئ)"
        />
        <span className={styles.hint}>اتركها فاضية عشان تختفي</span>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>مستوى التنبيه</label>
        <select
          value={ctx.noticeSeverity}
          onChange={(e) => ctx.setNoticeSeverity(e.target.value as 'info' | 'warning' | 'critical')}
          className={styles.select}
        >
          <option value="info">معلومات (رمادي)</option>
          <option value="warning">تحذير (برتقالي)</option>
          <option value="critical">عاجل (أحمر)</option>
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>ينتهي في (اختياري)</label>
        <input
          type="datetime-local"
          value={ctx.noticeExpiresAt}
          onChange={(e) => ctx.setNoticeExpiresAt(e.target.value)}
          className={styles.input}
        />
        <span className={styles.hint}>بعد الوقت ده التنبيه يختفي تلقائياً</span>
      </div>
      <SaveBar
        onClick={ctx.saveNotice}
        pending={ctx.pending}
        saved={ctx.savedSection === 'notice'}
      />
    </>
  )
}
