'use client'

import { GiftIcon, CheckCircleIcon, MapPinIcon, CrownGoldIcon } from '@/components/icons'
import type { WizardData } from './new-business-wizard'
import styles from './wizard.module.css'

const TYPES = [
  { value: 'restaurant', label: 'مطعم', Icon: GiftIcon },
  { value: 'pharmacy', label: 'صيدلية', Icon: CheckCircleIcon },
  { value: 'delivery_office', label: 'توصيل', Icon: MapPinIcon },
  { value: 'misc', label: 'أخرى', Icon: CrownGoldIcon },
] as const

type Props = {
  data: WizardData
  errors: Record<string, string>
  update: (patch: Partial<WizardData>) => void
}

export default function BasicsStep({ data, errors, update }: Props) {
  return (
    <div>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>الأساسيات</h2>
        <p className={styles.cardHint}>اختر نوع النشاط واكتب اسمه — تقدر تكمل الباقي بعدين</p>
      </div>

      <div className={styles.fields}>
        <div className={styles.field}>
          <span className={styles.label}>
            نوع النشاط <span className={styles.labelReq}>*</span>
          </span>
          <div className={styles.typeGrid} role="radiogroup" aria-label="نوع النشاط">
            {TYPES.map((t) => {
              const active = data.business_type === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => update({ business_type: t.value })}
                  className={`${styles.typeCard} ${active ? styles.typeCardActive : ''}`}
                  role="radio"
                  aria-checked={active}
                >
                  <span className={styles.typeCardIcon}>
                    <t.Icon size={16} />
                  </span>
                  <span className={styles.typeCardLabel}>{t.label}</span>
                </button>
              )
            })}
          </div>
          {errors.business_type && (
            <span className={styles.fieldError}>{errors.business_type}</span>
          )}
        </div>

        {data.business_type === 'misc' && (
          <label className={styles.field}>
            <span className={styles.label}>
              اكتب نوع النشاط <span className={styles.labelReq}>*</span>
            </span>
            <input
              type="text"
              value={data.custom_business_type ?? ''}
              onChange={(e) => update({ custom_business_type: e.target.value.slice(0, 50) })}
              className={`${styles.input} ${errors.custom_business_type ? styles.inputError : ''}`}
              placeholder="مثال: ماركت، حلاق، ورشة، جيم..."
              maxLength={50}
              dir="rtl"
            />
            {errors.custom_business_type ? (
              <span className={styles.fieldError}>{errors.custom_business_type}</span>
            ) : (
              <span className={styles.hint}>النوع ده محتاج موافقة الأدمن قبل ما النشاط يظهر</span>
            )}
          </label>
        )}

        <label className={styles.field}>
          <span className={styles.label}>
            اسم النشاط <span className={styles.labelReq}>*</span>
          </span>
          <input
            type="text"
            value={data.name}
            onChange={(e) => update({ name: e.target.value.slice(0, 80) })}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="مثال: مطعم البركة"
            maxLength={80}
            dir="rtl"
            autoFocus
          />
          {errors.name ? (
            <span className={styles.fieldError}>{errors.name}</span>
          ) : (
            <span className={styles.counter}>{data.name.length}/80</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            الهوك <span className={styles.hint}>سطر قصير يلفت الانتباه (اختياري)</span>
          </span>
          <input
            type="text"
            value={data.hook}
            onChange={(e) => update({ hook: e.target.value.slice(0, 120) })}
            className={styles.input}
            placeholder="أحلى كشري في شبين — جرّبه مرة"
            maxLength={120}
            dir="rtl"
          />
          <span className={styles.counter}>{data.hook.length}/120</span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            الوصف <span className={styles.hint}>اختياري — تقدر تضيفه بعدين</span>
          </span>
          <textarea
            value={data.description}
            onChange={(e) => update({ description: e.target.value.slice(0, 500) })}
            className={styles.textarea}
            placeholder="اكتب عن النشاط — إيه اللي يميزه؟"
            maxLength={500}
            rows={3}
            dir="rtl"
          />
          <span className={styles.counter}>{data.description.length}/500</span>
        </label>
      </div>
    </div>
  )
}
