'use client'

import { CartIcon, CheckCircleIcon, UserIcon } from '@/components/icons'
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
        <p className={styles.cardHint}>اضبط حالة النشاط وحدد التاجر المرتبط إن وجد</p>
      </div>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.label}>حساب التاجر المرتبط (اختياري)</span>
          <select
            value={data.owner_user_id}
            onChange={(e) => update({ owner_user_id: e.target.value })}
            className={styles.input}
          >
            <option value="">— بدون تاجر مرتبط —</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.display_name}
                {o.phone ? ` — ${o.phone}` : ''}
                {o.role === 'merchant' ? ' — تاجر' : ' — عميل'}
              </option>
            ))}
          </select>
          <span className={styles.hint}>
            <UserIcon size={11} /> ربط حساب التاجر اختياري. لو اخترت عميلًا، النظام يجهّز حسابه
            لإدارة النشاط المرتبط فقط. ولو سيبته فاضي، تقدر تربطه لاحقًا من الإدارة.
          </span>
        </label>

        {owners.length === 0 && (
          <p className={styles.gpsHint}>
            لا توجد حسابات عميل أو تاجر متاحة للربط حاليًا. تقدر تكمل إنشاء النشاط من غير تاجر
            مرتبط، وتربطه لاحقًا من الإدارة.
          </p>
        )}

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
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>طلبات أونلاين داخل EAH</span>
          <label
            className={`${styles.typeCard} ${
              data.accepts_online_orders ? styles.typeCardActive : ''
            }`}
          >
            <input
              type="checkbox"
              checked={data.accepts_online_orders}
              onChange={(e) => update({ accepts_online_orders: e.target.checked })}
              style={{ display: 'none' }}
            />
            <span className={styles.typeCardIcon}>
              <CartIcon size={16} />
            </span>
            <span className={styles.typeCardLabel}>
              {data.accepts_online_orders ? 'مفعّلة مبدئيًا' : 'غير مفعّلة'}
            </span>
          </label>
          <p className={styles.hint}>
            الطلبات داخل EAH مستقلة عن واتساب. لا يظهر زر الطلبات للزوار إلا بعد ربط التاجر
            واستكمال إعدادات الاستلام والرد والتسليم.
          </p>
        </div>

        <div className={styles.orderNotice} role="note">
          <span className={styles.orderNoticeIcon}>
            <CartIcon size={16} />
          </span>
          <div className={styles.orderNoticeBody}>
            <strong className={styles.orderNoticeTitle}>طلبات أونلاين داخل EAH</strong>
            <p className={styles.orderNoticeText}>
              قناة طلبات داخل EAH — مستقلة عن واتساب. تتفعّل من تبويب «إعدادات الطلبات» بعد
              ربط التاجر ووجود رقم تواصل. النشاط يُنشر بعد اكتمال بياناته وإنهاء المسودة.
            </p>
          </div>
        </div>

        <p className={styles.gpsHint}>
          صور الغلاف والشعار والمنيو تقدر تضيفها بعد الإنشاء من صفحة التعديل.
        </p>
      </div>
    </div>
  )
}
