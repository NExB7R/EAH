'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveCustomBusinessType } from '../edit-actions'
import { useBusinessForm } from '../business-form-context'
import { TYPES } from '../business-form-config'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

export default function BasicsSection() {
  const ctx = useBusinessForm()
  const router = useRouter()
  const [customType, setCustomType] = useState(ctx.business.custom_business_type ?? '')
  const [customTypeError, setCustomTypeError] = useState<string | null>(null)
  const [typePending, startTypeTransition] = useTransition()

  const submitCustomType = () => {
    setCustomTypeError(null)
    startTypeTransition(async () => {
      const result = await saveCustomBusinessType(ctx.business.id, customType)
      if (!result.ok) {
        setCustomTypeError(result.error)
        return
      }
      router.refresh()
    })
  }

  const customTypeStatus =
    ctx.business.business_type_status === 'approved'
      ? 'معتمد'
      : ctx.business.business_type_status === 'rejected'
        ? 'مرفوض — عدّل الاسم وأرسله للمراجعة'
        : ctx.business.business_type_status === 'pending'
          ? 'بانتظار مراجعة الإدارة'
          : 'لا يوجد اسم مخصص'

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
      {ctx.businessType === 'misc' && (
        <div className={styles.field}>
          <label className={styles.label}>اسم النوع المخصص (من 2 إلى 50 حرف)</label>
          <input
            value={customType}
            onChange={(e) => setCustomType(e.target.value.slice(0, 50))}
            maxLength={50}
            className={styles.input}
            dir="rtl"
            placeholder="مثال: مغسلة ملابس"
          />
          <span className={styles.hint}>
            {ctx.business.business_type !== 'misc'
              ? 'احفظ اختيار «أخرى» من زر حفظ الأساسيات أولًا، وبعدها أرسل الاسم المخصص للمراجعة.'
              : `الحالة الحالية: ${customTypeStatus}. تعديل الاسم يعيده للمراجعة، لكن النشاط نفسه يظل ظاهرًا على المنصة.`}
          </span>
          {customTypeError && <p className={styles.errMsg} role="alert">{customTypeError}</p>}
          <button
            type="button"
            onClick={submitCustomType}
            disabled={typePending || ctx.business.business_type !== 'misc' || customType.trim().length < 2}
            className={styles.saveBtn}
          >
            {typePending ? 'جاري الإرسال…' : 'حفظ وإرسال النوع للمراجعة'}
          </button>
        </div>
      )}
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
