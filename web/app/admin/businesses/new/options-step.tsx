'use client'

import { hasUsableWhatsAppDestination } from '@/lib/data/contact-availability-utils'

import { CheckCircleIcon, WhatsAppIcon, UserIcon, SparklesIcon } from '@/components/icons'
import type { WizardData, OwnerOption } from './new-business-wizard'
import styles from './wizard.module.css'

type Props = {
  data: WizardData
  owners: OwnerOption[]
  update: (patch: Partial<WizardData>) => void
}

export default function OptionsStep({ data, owners, update }: Props) {
  const hasWhatsAppContact = data.contacts.some(
    (contact) =>
      contact.kind === 'whatsapp' && hasUsableWhatsAppDestination(contact.value),
  )

  return (
    <div>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>الخيارات والحالة</h2>
        <p className={styles.cardHint}>اضبط الحالة الافتراضية وحدد التاجر إن وجد</p>
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
            <UserIcon size={11} /> اختيار الحساب اختياري. لو اخترت حساب عميل، سيحوّله النظام إلى تاجر ويمنحه وحده صلاحية إدارة النشاط المرتبط به.
            ولو سيبت الاختيار فاضي، النشاط هيتنشر ويظهر للزوار من غير تاجر مرتبط.
          </span>
        </label>

        {owners.length === 0 && (
          <p className={styles.gpsHint}>
            لا توجد حسابات عميل أو تاجر متاحة للربط حاليًا. تقدر تكمل إنشاء النشاط من غير تاجر مرتبط، وتربطه لاحقًا من الإدارة.
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
                    ? 'يستقبل طلبات واتساب'
                    : 'لا يستقبل'}
              </span>
            </label>
          </div>
          {!hasWhatsAppContact && (
            <p className={styles.hint}>
              علشان تفعّل استقبال طلبات واتساب، أضف رقمًا صالحًا من نوع «واتساب» في خطوة الموقع والتواصل. وجود رقم للتواصل وحده لا يفعّل استقبال الطلبات تلقائيًا.
            </p>
          )}
        </div>

        <div className={styles.field}>
          <span className={styles.label}>الظهور بعد الإنشاء</span>
          <label className={`${styles.typeCard} ${data.is_new_project ? styles.typeCardActive : ''}`}>
            <input
              type="checkbox"
              checked={data.is_new_project}
              onChange={(e) => update({ is_new_project: e.target.checked })}
              style={{ display: 'none' }}
            />
            <span className={styles.typeCardIcon}><SparklesIcon size={16} /></span>
            <span className={styles.typeCardLabel}>{data.is_new_project ? 'جديد لمدة شهر' : 'أنشطة جديدة'}</span>
          </label>
          <p className={styles.hint}>
            يظهر النشاط في قسم الجديد لمدة 30 يومًا من وقت الإنشاء. اختيار «مميز» يتم بعد ربط اشتراك مدفوع يمنح ظهور الرئيسية، من صفحة تعديل النشاط.
          </p>
        </div>>

        <p className={styles.gpsHint}>
          صور الغلاف والشعار والمعرض تقدر تضيفها بعد إنشاء النشاط من صفحة التعديل.
        </p>
      </div>
    </div>
  )
}
