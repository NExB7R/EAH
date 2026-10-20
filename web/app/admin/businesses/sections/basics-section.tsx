'use client'

import { useBusinessForm } from '../business-form-context'
import { TYPES } from '../business-form-config'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

export default function BasicsSection() {
  const ctx = useBusinessForm()
  return (
    <>
      <div className={styles.field}>
        <label className={styles.label}>الاسم</label>
        <input
          value={ctx.name}
          onChange={(e) => ctx.setName(e.target.value)}
          className={styles.input}
          dir="rtl"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Slug</label>
        <input
          value={ctx.slug}
          onChange={(e) => ctx.setSlug(e.target.value)}
          className={styles.input}
          dir="ltr"
        />
      </div>
      <div className={styles.field}>
        <span className={styles.label}>النوع</span>
        <div className={styles.typeGrid}>
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`${styles.typeCard} ${ctx.businessType === t.value ? styles.typeCardActive : ''}`}
              onClick={() => ctx.setBusinessType(t.value)}
            >
              <t.Icon size={18} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label}>المنطقة</label>
          <input
            value={ctx.area}
            onChange={(e) => ctx.setArea(e.target.value)}
            className={styles.input}
            dir="rtl"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>المدينة</label>
          <input
            value={ctx.city}
            onChange={(e) => ctx.setCity(e.target.value)}
            className={styles.input}
            dir="rtl"
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>العنوان</label>
        <input
          value={ctx.addressText}
          onChange={(e) => ctx.setAddressText(e.target.value)}
          className={styles.input}
          dir="rtl"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Hook</label>
        <input
          value={ctx.hook}
          onChange={(e) => ctx.setHook(e.target.value)}
          maxLength={120}
          className={styles.input}
          dir="rtl"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>الوصف</label>
        <textarea
          value={ctx.description}
          onChange={(e) => ctx.setDescription(e.target.value)}
          rows={4}
          className={styles.textarea}
          dir="rtl"
        />
      </div>
      <SaveBar
        onClick={ctx.saveBasics}
        pending={ctx.pending}
        saved={ctx.savedSection === 'basics'}
      />
    </>
  )
}
