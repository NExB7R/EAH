'use client'

import { useBusinessForm } from '../business-form-context'
import { getContact } from '../business-form-config'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

const FIELDS: { name: string; label: string; placeholder?: string }[] = [
  { name: 'phone', label: 'رقم الهاتف', placeholder: '01xxxxxxxxx' },
  { name: 'whatsapp', label: 'واتساب', placeholder: '01xxxxxxxxx' },
  { name: 'facebook', label: 'فيسبوك' },
  { name: 'instagram', label: 'إنستجرام' },
  { name: 'website', label: 'الموقع الإلكتروني' },
]

export default function ContactsSection() {
  const ctx = useBusinessForm()
  return (
    <form id="contacts-form" className={styles.sections}>
      {FIELDS.map((f) => (
        <div key={f.name} className={styles.field}>
          <label className={styles.label}>{f.label}</label>
          <input
            name={f.name}
            defaultValue={getContact(ctx.business, f.name)}
            className={styles.input}
            dir={
              f.name === 'facebook' || f.name === 'instagram' || f.name === 'website'
                ? 'ltr'
                : 'ltr'
            }
            placeholder={f.placeholder}
          />
        </div>
      ))}
      <SaveBar
        onClick={ctx.saveContacts}
        pending={ctx.pending}
        saved={ctx.savedSection === 'contacts'}
      />
    </form>
  )
}
