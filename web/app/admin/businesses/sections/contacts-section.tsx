'use client'

import { useBusinessForm } from '../business-form-context'
import { getContact } from '../business-form-config'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

const FIXED_FIELDS: { name: string; label: string; placeholder?: string }[] = [
  { name: 'phone', label: 'رقم الهاتف الأساسي', placeholder: '01xxxxxxxxx' },
  { name: 'whatsapp', label: 'واتساب', placeholder: '01xxxxxxxxx' },
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

export default function ContactsSection() {
  const ctx = useBusinessForm()
  const additionalCount = ctx.business.contacts.filter((c) => c.method_type === 'additional').length

  return (
    <form id="contacts-form" className={styles.sections}>
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
