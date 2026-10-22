'use client'

import type { WizardData, OwnerOption } from './new-business-wizard'
import styles from './wizard.module.css'

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
  misc: 'أخرى',
}

type Props = {
  data: WizardData
  owners: OwnerOption[]
  goTo: (index: number) => void
}

function Item({
  label,
  value,
  empty,
  step,
  goTo,
}: {
  label: string
  value: string | null | undefined
  empty?: boolean
  step: number
  goTo: (i: number) => void
}) {
  return (
    <div className={styles.reviewItem}>
      <span className={styles.reviewLabel}>{label}</span>
      <span className={`${styles.reviewValue} ${empty ? styles.reviewEmpty : ''}`}>
        {empty ? '— غير محدد —' : value}
      </span>
      <button type="button" onClick={() => goTo(step)} className={styles.reviewEdit}>
        تعديل
      </button>
    </div>
  )
}

export default function ReviewStep({ data, owners, goTo }: Props) {
  const owner = owners.find((o) => o.id === data.owner_user_id)
  const needsTypeApproval =
    data.business_type === 'misc' && data.custom_business_type.trim().length > 0
  const publishStatus = needsTypeApproval
    ? owner
      ? 'سينشر تحت «أخرى» — النوع المخصص قيد المراجعة'
      : 'سينشر تحت «أخرى» — بدون مالك، والنوع قيد المراجعة'
    : owner
      ? 'جاهز للنشر — مع مالك مرتبط'
      : 'جاهز للنشر — بدون مالك مرتبط'

  return (
    <div>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>مراجعة نهائية</h2>
        <p className={styles.cardHint}>
          راجع البيانات كويس قبل الإنشاء — تقدر تعدّل أي حقل من الزر جنبه
        </p>
      </div>

      <div className={styles.reviewGrid}>
        <Item
          label="النوع"
          value={TYPE_LABEL[data.business_type] ?? data.business_type}
          step={0}
          goTo={goTo}
        />
        <Item label="الاسم" value={data.name} step={0} goTo={goTo} />
        <Item label="الهوك" value={data.hook} empty={!data.hook} step={0} goTo={goTo} />
        <Item label="المنطقة" value={data.area} empty={!data.area} step={1} goTo={goTo} />
        <Item
          label="العنوان"
          value={data.address_text}
          empty={!data.address_text}
          step={1}
          goTo={goTo}
        />
        <Item
          label="أرقام التواصل"
          value={`${data.contacts.filter((c) => c.value.trim()).length} رقم`}
          empty={data.contacts.filter((c) => c.value.trim()).length === 0}
          step={1}
          goTo={goTo}
        />
        <Item
          label="صاحب النشاط"
          value={owner?.display_name ?? null}
          empty={!owner}
          step={2}
          goTo={goTo}
        />
        <Item label="حالة النشر" value={publishStatus} step={2} goTo={goTo} />
        <Item label="الحالة" value={data.is_open ? 'مفتوح الآن' : 'مغلق'} step={2} goTo={goTo} />
        <Item
          label="واتساب أوردرز"
          value={data.accepts_whatsapp_orders ? 'يستقبل' : 'لا يستقبل'}
          step={2}
          goTo={goTo}
        />
      </div>

      {data.description && (
        <div style={{ marginTop: '16px' }}>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>الوصف</span>
            <span className={styles.reviewValue} style={{ fontWeight: 600, lineHeight: 1.6 }}>
              {data.description}
            </span>
            <button type="button" onClick={() => goTo(0)} className={styles.reviewEdit}>
              تعديل
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px' }} className={styles.draftBar}>
        <span>
          {needsTypeApproval
            ? 'النشاط هيتنشر على المنصة ضمن فئة «أخرى» حتى يتم اعتماد الاسم المخصص. موافقة النوع لا تتحكم في ظهور النشاط، والمالك يظل هو الحساب المختار.'
            : owner
              ? 'البيانات جاهزة — النشاط هيتنشر والمالك المختار هيتربط به.'
              : 'النشاط هيتنشر على المنصة بدون مالك مرتبط، وتقدر تربطه بحساب مسجل لاحقًا من الإدارة.'}
        </span>
      </div>
    </div>
  )
}
