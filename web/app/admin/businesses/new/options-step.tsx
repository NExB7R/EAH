'use client'

import { CheckCircleIcon, WhatsAppIcon, UserIcon } from '@/components/icons'
import type { WizardData, OwnerOption } from './new-business-wizard'
import styles from './wizard.module.css'

type Props = {
  data: WizardData
  owners: OwnerOption[]
  update: (patch: Partial<WizardData>) => void
}

export default function OptionsStep({ data, owners, update }: Props) {
  return (
    <div>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>الخيارات والحالة</h2>
        <p className={styles.cardHint}>اضبط الحالة الافتراضية وصاحب النشاط</p>
      </div>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.label}>صاحب النشاط</span>
          <select
            value={data.owner_user_id}
            onChange={(e) => update({ owner_user_id: e.target.value })}
            className={styles.input}
          >
            <option value="">— بدون مالك (نشاط إداري) —</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.display_name}
              </option>
            ))}
          </select>
          <span className={styles.hint}>
            <UserIcon size={11} /> لو سبت المالك فاضي، النشاط هيتحفظ كمسودة غير منشورة لحد ما تربطه بمالكه
          </span>
        </label>

        <div className={styles.field}>
          <span className={styles.label}>الحالة الافتراضية</span>
          <div className={styles.row}>
            <label className={`${styles.typeCard} ${data.is_open ? styles.typeCardActive : ''}`}>
              <input
                type="checkbox"
                checked={data.is_open}
                onChange={(e) => update({ is_open: e.target.checked })}
                style={{ display: 'none' }}
              />
              <span className={styles.typeCardIcon}>
                <CheckCircleIcon size={16} />
              </span>
              <span className={styles.typeCardLabel}>{data.is_open ? 'مفتوح الآن' : 'مغلق'}</span>
            </label>

            <label
              className={`${styles.typeCard} ${data.accepts_whatsapp_orders ? styles.typeCardActive : ''}`}
            >
              <input
                type="checkbox"
                checked={data.accepts_whatsapp_orders}
                onChange={(e) => update({ accepts_whatsapp_orders: e.target.checked })}
                style={{ display: 'none' }}
              />
              <span className={styles.typeCardIcon}>
                <WhatsAppIcon size={16} />
              </span>
              <span className={styles.typeCardLabel}>
                {data.accepts_whatsapp_orders ? 'يستقبل واتساب' : 'لا يستقبل'}
              </span>
            </label>
          </div>
        </div>

        <p className={styles.gpsHint}>
          💡 الصور (Logo + Cover) بتتضاف بعد إنشاء النشاط من صفحة النشاط.
        </p>
      </div>
    </div>
  )
}
