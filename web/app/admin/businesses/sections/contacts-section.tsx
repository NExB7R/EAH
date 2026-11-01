'use client'

import { useState } from 'react'
import { useBusinessForm } from '../business-form-context'
import { getContact } from '../business-form-config'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

const FIXED_FIELDS: { name: string; label: string; placeholder?: string }[] = [
  { name: 'facebook', label: 'فيسبوك', placeholder: 'https://facebook.com/...' },
  { name: 'instagram', label: 'إنستجرام', placeholder: 'https://instagram.com/...' },
  { name: 'website', label: 'الموقع الإلكتروني', placeholder: 'https://...' },
]

const EXTENDED_FIELDS: { name: string; label: string; placeholder?: string }[] = [
  { name: 'complaints', label: 'شكاوى واقتراحات', placeholder: '01xxxxxxxxx' },
  { name: 'manager', label: 'مسئول النشاط', placeholder: '01xxxxxxxxx' },
  { name: 'shift_morning', label: 'مسئول شفت صباحي', placeholder: '01xxxxxxxxx' },
  { name: 'shift_evening', label: 'مسئول شفت مسائي', placeholder: '01xxxxxxxxx' },
]

type ContactInput = { id: string; value: string }

function getInitialNumbers(
  contacts: { method_type: string; value: string; is_primary: boolean; sort_order?: number | null }[],
  kind: 'phone' | 'whatsapp',
): ContactInput[] {
  const values = contacts
    .filter((contact) => contact.method_type === kind)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
  return values.length
    ? values.map((contact, index) => ({ id: `${kind}-${index}`, value: contact.value }))
    : [{ id: `${kind}-empty`, value: '' }]
}

export default function ContactsSection() {
  const ctx = useBusinessForm()
  const additionalCount = ctx.business.contacts.filter((c) => c.method_type === 'additional').length
  const [phoneNumbers, setPhoneNumbers] = useState<ContactInput[]>(() =>
    getInitialNumbers(ctx.business.contacts, 'phone'),
  )
  const [whatsappNumbers, setWhatsappNumbers] = useState<ContactInput[]>(() =>
    getInitialNumbers(ctx.business.contacts, 'whatsapp'),
  )

  const addNumber = (setter: React.Dispatch<React.SetStateAction<ContactInput[]>>) => {
    setter((current) =>
      current.length >= 10 ? current : [...current, { id: crypto.randomUUID(), value: '' }],
    )
  }

  const removeNumber = (
    setter: React.Dispatch<React.SetStateAction<ContactInput[]>>,
    id: string,
  ) => {
    setter((current) => current.length <= 1 ? current : current.filter((item) => item.id !== id))
  }

  return (
    <form id="contacts-form" className={styles.sections}>
      <input
        type="hidden"
        name="phone_numbers_json"
        value={JSON.stringify(phoneNumbers.map((item) => item.value.trim()).filter(Boolean))}
      />
      <input
        type="hidden"
        name="whatsapp_numbers_json"
        value={JSON.stringify(whatsappNumbers.map((item) => item.value.trim()).filter(Boolean))}
      />

      <div className={styles.field}>
        <label className={styles.label}>أرقام الاتصال</label>
        {phoneNumbers.map((contact, index) => (
          <div className={styles.row} key={contact.id}>
            <input
              value={contact.value}
              onChange={(event) =>
                setPhoneNumbers((current) =>
                  current.map((item) =>
                    item.id === contact.id ? { ...item, value: event.target.value } : item,
                  ),
                )
              }
              className={styles.input}
              dir="ltr"
              placeholder={index === 0 ? 'رقم الهاتف الأساسي — 01xxxxxxxxx' : 'رقم هاتف إضافي'}
              required={index === 0}
              inputMode="tel"
            />
            {phoneNumbers.length > 1 && (
              <button
                type="button"
                className={styles.cancelBtn}
                aria-label={`حذف رقم الاتصال ${index + 1}`}
                onClick={() => removeNumber(setPhoneNumbers, contact.id)}
              >
                حذف
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className={styles.submitBtn}
          disabled={phoneNumbers.length >= 10}
          onClick={() => addNumber(setPhoneNumbers)}
        >
          + إضافة رقم اتصال
        </button>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>أرقام واتساب</label>
        {whatsappNumbers.map((contact, index) => (
          <div className={styles.row} key={contact.id}>
            <input
              value={contact.value}
              onChange={(event) =>
                setWhatsappNumbers((current) =>
                  current.map((item) =>
                    item.id === contact.id ? { ...item, value: event.target.value } : item,
                  ),
                )
              }
              className={styles.input}
              dir="ltr"
              placeholder="رقم واتساب إضافي"
              inputMode="tel"
            />
            {whatsappNumbers.length > 1 && (
              <button
                type="button"
                className={styles.cancelBtn}
                aria-label={`حذف رقم واتساب ${index + 1}`}
                onClick={() => removeNumber(setWhatsappNumbers, contact.id)}
              >
                حذف
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className={styles.submitBtn}
          disabled={whatsappNumbers.length >= 10}
          onClick={() => addNumber(setWhatsappNumbers)}
        >
          + إضافة رقم واتساب
        </button>
      </div>

      {FIXED_FIELDS.map((f) => (
        <div key={f.name} className={styles.field}>
          <label className={styles.label}>{f.label}</label>
          <input
            name={f.name}
            defaultValue={getContact(ctx.business, f.name)}
            className={styles.input}
            dir="ltr"
            placeholder={f.placeholder}
          />
        </div>
      ))}

      {EXTENDED_FIELDS.map((f) => (
        <div key={f.name} className={styles.field}>
          <label className={styles.label}>{f.label}</label>
          <input
            name={f.name}
            defaultValue={getContact(ctx.business, f.name)}
            className={styles.input}
            dir="ltr"
            placeholder={f.placeholder}
          />
        </div>
      ))}

      {additionalCount > 0 && (
        <p className={styles.hint}>أرقام إضافية: {additionalCount} (تُدار من الـwizard)</p>
      )}

      <SaveBar
        onClick={ctx.saveContacts}
        pending={ctx.pending}
        saved={ctx.savedSection === 'contacts'}
      />
    </form>
  )
}
