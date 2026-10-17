'use client'

import { MapPinIcon, PhoneIcon, WhatsAppIcon } from '@/components/icons'
import type { WizardData } from './new-business-wizard'
import styles from './wizard.module.css'

type Props = {
  data: WizardData
  errors: Record<string, string>
  update: (patch: Partial<WizardData>) => void
}

export default function LocationStep({ data, errors, update }: Props) {
  return (
    <div>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>الموقع والتواصل</h2>
        <p className={styles.cardHint}>
          كل الحقول هنا اختيارية — لكن كل ما تكمل، العملاء يلاقوك أسرع
        </p>
      </div>

      <div className={styles.fields}>
        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>
              <MapPinIcon size={12} /> المنطقة
            </span>
            <input
              type="text"
              value={data.area}
              onChange={(e) => update({ area: e.target.value.slice(0, 50) })}
              className={styles.input}
              placeholder="شبين القناطر"
              maxLength={50}
              dir="rtl"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>العنوان التفصيلي</span>
            <input
              type="text"
              value={data.address_text}
              onChange={(e) => update({ address_text: e.target.value.slice(0, 200) })}
              className={styles.input}
              placeholder="شارع الجمهورية — أمام مسجد النور"
              maxLength={200}
              dir="rtl"
            />
          </label>
        </div>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>
              <PhoneIcon size={12} /> رقم التليفون
            </span>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) =>
                update({ phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 11) })
              }
              className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
              placeholder="010xxxxxxxx"
              maxLength={11}
              dir="ltr"
            />
            {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              <WhatsAppIcon size={12} /> رقم الواتساب
            </span>
            <input
              type="tel"
              value={data.whatsapp}
              onChange={(e) =>
                update({ whatsapp: e.target.value.replace(/[^0-9]/g, '').slice(0, 11) })
              }
              className={`${styles.input} ${errors.whatsapp ? styles.inputError : ''}`}
              placeholder="010xxxxxxxx"
              maxLength={11}
              dir="ltr"
            />
            {errors.whatsapp && <span className={styles.fieldError}>{errors.whatsapp}</span>}
          </label>
        </div>

        <p className={styles.gpsHint}>
          💡 الإحداثيات (GPS) تقدر تضيفها بعد الإنشاء من صفحة النشاط.
        </p>
      </div>
    </div>
  )
}
