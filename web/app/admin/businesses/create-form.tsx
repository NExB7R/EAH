'use client'

import { useRouter } from 'next/navigation'
import { AlertIcon } from '@/components/icons'
import type { BusinessOwnerOption } from '@/lib/data/admin-business'
import { useBusinessFormState } from './business-form-hooks'
import { TYPES } from './business-form-config'
import { Section } from './business-form-shared'
import styles from './business-form.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Form: Create mode
// Minimal form — basics only. Edit is where the rest happens.
// ═══════════════════════════════════════════════════════════

export default function CreateForm({ owners }: { owners: BusinessOwnerOption[] }) {
  const state = useBusinessFormState(null)
  const router = useRouter()

  return (
    <form onSubmit={state.handleCreate} className={styles.sections}>
      {state.error && (
        <div className={styles.errMsg}>
          <AlertIcon size={14} /> {state.error}
        </div>
      )}

      <Section sectionKey="basics" open onToggle={() => {}}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            الاسم
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={80}
            className={styles.input}
            dir="rtl"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="slug">
            الرابط المختصر
          </label>
          <input
            id="slug"
            name="slug"
            required
            minLength={2}
            maxLength={80}
            pattern="[a-z0-9-]+"
            className={styles.input}
            dir="ltr"
          />
          <span className={styles.hint}>استخدم حروفًا لاتينية صغيرة وأرقامًا وشرطات فقط</span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>النوع</span>
          <div className={styles.typeGrid}>
            {TYPES.map((t) => (
              <label key={t.value} className={styles.typeCard}>
                <input
                  type="radio"
                  name="business_type"
                  value={t.value}
                  defaultChecked={t.value === 'restaurant'}
                  className={styles.srOnly}
                />
                <t.Icon size={18} />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="area">
              المنطقة
            </label>
            <input id="area" name="area" maxLength={60} className={styles.input} dir="rtl" />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="city">
              المدينة
            </label>
            <input
              id="city"
              name="city"
              maxLength={60}
              defaultValue="شبين القناطر"
              className={styles.input}
              dir="rtl"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="address_text">
            العنوان
          </label>
          <input
            id="address_text"
            name="address_text"
            maxLength={200}
            className={styles.input}
            dir="rtl"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="hook">
            عبارة تعريفية قصيرة
          </label>
          <input id="hook" name="hook" maxLength={120} className={styles.input} dir="rtl" />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">
            الوصف
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={1000}
            className={styles.textarea}
            dir="rtl"
          />
        </div>
      </Section>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="owner_profile_id">
          التاجر المرتبط بالنشاط
        </label>
        <select
          id="owner_profile_id"
          name="owner_profile_id"
          className={styles.select}
          defaultValue=""
        >
          <option value="">بدون تاجر مرتبط</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.display_name} {o.phone ? `— ${o.phone}` : ''}
            </option>
          ))}
        </select>
        <span className={styles.hint}>
          اختيار التاجر المرتبط اختياري. يمكن نشر النشاط دون ربط حساب تاجر، ثم ربطه لاحقًا من لوحة الإدارة.
        </span>
      </div>

      <div className={styles.checkRow}>
        <input id="is_published" name="is_published" type="checkbox" />
        <label htmlFor="is_published">نشر مباشر</label>
      </div>

      <div className={styles.submitBar}>
        <button type="submit" disabled={state.pending} className={styles.submitBtn}>
          {state.pending ? 'جاري الإنشاء...' : 'إنشاء النشاط'}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={() => router.back()}>
          إلغاء
        </button>
      </div>
    </form>
  )
}
