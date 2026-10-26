'use client'

import { useBusinessForm } from '../business-form-context'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

export default function SettingsSection() {
  const ctx = useBusinessForm()
  return (
    <>
      <div className={styles.checkRow}>
        <input
          id="is_published"
          type="checkbox"
          checked={ctx.isPublished}
          onChange={(e) => ctx.setIsPublished(e.target.checked)}
        />
        <label htmlFor="is_published">منشور على المنصة</label>
      </div>
      <div className={styles.checkRow}>
        <input
          id="is_open"
          type="checkbox"
          checked={ctx.isOpen}
          onChange={(e) => ctx.setIsOpen(e.target.checked)}
        />
        <label htmlFor="is_open">مفتوح حالياً</label>
      </div>
      <div className={styles.checkRow}>
        <input
          id="accepts_whatsapp_orders"
          type="checkbox"
          checked={ctx.acceptsWhatsapp}
          onChange={(e) => ctx.setAcceptsWhatsapp(e.target.checked)}
        />
        <label htmlFor="accepts_whatsapp_orders">تفعيل زر تواصل واتساب</label>
      </div>

      <p
        style={{
          margin: '4px 0 12px',
          fontSize: '0.72rem',
          color: 'var(--text-tertiary)',
          lineHeight: 1.5,
        }}
      >
        ملاحظة: استقبال الطلبات نفسها يُدار من لوحة Order Settings فوق (تفعيل/إيقاف + مدة الرد
        والتسليم).
      </p>

      <div className={styles.checkRow}>
        <input
          id="is_featured"
          type="checkbox"
          checked={ctx.isFeatured}
          onChange={(e) => ctx.setIsFeatured(e.target.checked)}
        />
        <label htmlFor="is_featured">مميز (Featured)</label>
      </div>

      <div className={styles.checkRow}>
        <input
          id="is_verified"
          type="checkbox"
          checked={ctx.isVerified}
          onChange={(e) => ctx.setIsVerified(e.target.checked)}
        />
        <label htmlFor="is_verified">☑️ موثق (Verified) — شهادة EAH الرسمية</label>
      </div>

      {ctx.isFeatured && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>ترتيب المميز (0-999)</label>
            <input
              type="number"
              min={0}
              max={999}
              value={ctx.featuredOrder}
              onChange={(e) => ctx.setFeaturedOrder(parseInt(e.target.value) || 0)}
              className={styles.input}
            />
          </div>
          <div className={styles.checkRow}>
            <input
              id="featured_pin"
              type="checkbox"
              checked={ctx.featuredPin}
              onChange={(e) => ctx.setFeaturedPin(e.target.checked)}
            />
            <label htmlFor="featured_pin">مثبّت في المقدمة</label>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>ينتهي التمييز في</label>
            <input
              type="date"
              value={ctx.featuredUntil}
              onChange={(e) => ctx.setFeaturedUntil(e.target.value)}
              className={styles.input}
            />
          </div>
        </>
      )}

      <div className={styles.checkRow}>
        <input
          id="is_new_project"
          type="checkbox"
          checked={ctx.isNewProject}
          onChange={(e) => ctx.setIsNewProject(e.target.checked)}
        />
        <label htmlFor="is_new_project">بدايات (مشروع جديد)</label>
      </div>

      {ctx.isNewProject && (
        <div className={styles.field}>
          <label className={styles.label}>ينتهي في</label>
          <input
            type="date"
            value={ctx.newUntil}
            onChange={(e) => ctx.setNewUntil(e.target.value)}
            className={styles.input}
          />
        </div>
      )}

      <SaveBar
        onClick={ctx.saveSettings}
        pending={ctx.pending}
        saved={ctx.savedSection === 'settings'}
      />
    </>
  )
}
