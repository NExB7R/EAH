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
  const hasWhatsAppContact = data.contacts.some(
    (contact) => contact.kind === 'whatsapp' && contact.value.trim().length > 0,
  )

  return (
    <div>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>الخيارات والحالة</h2>
        <p className={styles.cardHint}>اضبط الحالة الافتراضية وحدد البايع إن وجد</p>
      </div>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.label}>ربط النشاط ببايع (اختياري)</span>
          <select
            value={data.owner_user_id}
            onChange={(e) => update({ owner_user_id: e.target.value })}
            className={styles.input}
          >
            <option value="">— بدون بايع مرتبط —</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.display_name}
                {o.phone ? ` — ${o.phone}` : ''}
                {o.role === 'merchant' ? ' — بايع' : ' — مشتري'}
              </option>
            ))}
          </select>
          <span className={styles.hint}>
            <UserIcon size={11} /> اختيار البايع اختياري. لو اخترت حسابًا، هيكون مالك النشاط ويقدر يديره كـ بايع. ولو سيبتها فاضية،
            النشاط هيتنشر ويظهر للزوار من غير بايع مرتبط.
          </span>
        </label>

        {owners.length === 0 && (
          <p className={styles.gpsHint}>
            لا توجد حسابات مشتري أو بايع مؤهلة للربط حاليًا. تقدر تكمل إنشاء النشاط من غير بايع مرتبط، وتربطه لاحقًا من الإدارة.
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

            <label
              className={`${styles.typeCard} ${hasWhatsAppContact && data.accepts_whatsapp_orders ? styles.typeCardActive : ''}`}
              aria-disabled={!hasWhatsAppContact}
            >
              <input
                type="checkbox"
                checked={hasWhatsAppContact && data.accepts_whatsapp_orders}
                disabled={!hasWhatsAppContact}
                onChange={(e) => update({ accepts_whatsapp_orders: e.target.checked })}
                style={{ display: 'none' }}
              />
              <span className={styles.typeCardIcon}>
                <WhatsAppIcon size={16} />
              </span>
              <span className={styles.typeCardLabel}>
                {!hasWhatsAppContact
                  ? 'أضف رقم واتساب أولًا'
                  : data.accepts_whatsapp_orders
                    ? 'يستقبل واتساب'
                    : 'لا يستقبل'}
              </span>
            </label>
          </div>
          {!hasWhatsAppContact && (
            <p className={styles.hint}>
              علشان تفعّل التواصل عبر واتساب، أضف رقمًا من نوع «واتساب» في خطوة الموقع والتواصل.
            </p>
          )}
        </div>

        <p className={styles.gpsHint}>
          صور الغلاف والشعار والمعرض تقدر تضيفها بعد إنشاء النشاط من صفحة التعديل.
        </p>
      </div>
    </div>
  )
}
