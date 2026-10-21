'use client'

import { MapPinIcon, PhoneIcon, CloseIcon } from '@/components/icons'
import type { WizardData, Contact, ContactKind } from './new-business-wizard'
import styles from './wizard.module.css'

const KIND_OPTIONS: { value: ContactKind; label: string }[] = [
  { value: 'phone', label: 'اتصال مباشر' },
  { value: 'whatsapp', label: 'واتساب' },
  { value: 'complaints', label: 'الشكاوى والاقتراحات' },
  { value: 'manager', label: 'المسئول الأول' },
  { value: 'shift_morning', label: 'شيفت صباحي' },
  { value: 'shift_evening', label: 'شيفت مسائي' },
  { value: 'additional', label: 'رقم إضافي' },
]

const MAX_CONTACTS = 15

function newContact(): Contact {
  return {
    tempId: `c${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: 'phone',
    value: '',
    is_primary: false,
  }
}

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
          المنطقة والعنوان والأرقام الإضافية اختيارية. مطلوب رقم تواصل للنشاط نفسه، ومش محتاج رقمًا شخصيًا لصاحب النشاط.
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
              placeholder="اكتب عنوانك بالتفصيل (مثال: أمام مسجد النور، بجوار صيدلية..)"
              maxLength={200}
              dir="rtl"
            />
          </label>
        </div>

        <div className={styles.contactsBlock}>
          <div className={styles.contactsHeader}>
            <span className={styles.label}>
              <PhoneIcon size={12} /> أرقام التواصل <span className={styles.labelReq}>*</span>
            </span>
            <span className={styles.counter}>
              {data.contacts.length}/{MAX_CONTACTS}
            </span>
          </div>

          <div className={styles.contactsList}>
            {data.contacts.map((contact, idx) => (
              <div key={contact.tempId} className={styles.contactRow}>
                <select
                  value={contact.kind}
                  onChange={(e) => {
                    const kind = e.target.value as ContactKind
                    const anotherPrimaryPhoneExists = data.contacts.some(
                      (c) => c.tempId !== contact.tempId && c.kind === 'phone' && c.is_primary,
                    )
                    const isPrimary =
                      kind === 'phone' && (contact.is_primary || !anotherPrimaryPhoneExists)
                    update({
                      contacts: data.contacts.map((c) =>
                        c.tempId === contact.tempId ? { ...c, kind, is_primary: isPrimary } : c,
                      ),
                    })
                  }}
                  className={styles.contactKind}
                >
                  {KIND_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  value={contact.value}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 13)
                    update({
                      contacts: data.contacts.map((c) =>
                        c.tempId === contact.tempId ? { ...c, value: v } : c,
                      ),
                    })
                  }}
                  className={styles.contactInput}
                  placeholder="01xxxxxxxxx"
                  maxLength={13}
                  dir="ltr"
                />

                {contact.kind === 'phone' && idx === 0 ? (
                  <span className={styles.primaryBadge}>أساسي</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      update({
                        contacts: data.contacts.filter((c) => c.tempId !== contact.tempId),
                      })
                    }}
                    className={styles.contactRemove}
                    aria-label="حذف"
                  >
                    <CloseIcon size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {data.contacts.length < MAX_CONTACTS && (
            <button
              type="button"
              onClick={() => {
                update({ contacts: [...data.contacts, newContact()] })
              }}
              className={styles.addContactBtn}
            >
              + إضافة رقم آخر
            </button>
          )}

          {errors.contacts && <span className={styles.fieldError}>{errors.contacts}</span>}
        </div>

        <p className={styles.gpsHint}>
          💡 الإحداثيات (GPS) تقدر تضيفها بعد الإنشاء من صفحة النشاط.
        </p>
      </div>
    </div>
  )
}
