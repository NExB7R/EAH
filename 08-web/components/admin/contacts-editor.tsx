'use client'
import { useState, useEffect } from 'react'
import PrettySelect from './pretty-select'

export type Contact = {
  method_type: 'phone' | 'whatsapp' | 'facebook' | 'instagram' | 'website' | 'email'
  value: string
  is_primary: boolean
}

const TYPE_OPTIONS = [
  { value: 'phone', label: 'فون', emoji: '📞' },
  { value: 'whatsapp', label: 'واتساب', emoji: '💬' },
  { value: 'facebook', label: 'فيسبوك', emoji: '📘' },
  { value: 'instagram', label: 'إنستجرام', emoji: '📷' },
  { value: 'website', label: 'موقع', emoji: '🌐' },
  { value: 'email', label: 'إيميل', emoji: '✉️' },
]

const PLACEHOLDERS: Record<string, string> = {
  phone: '01012345678',
  whatsapp: '201012345678',
  facebook: 'https://facebook.com/page',
  instagram: 'https://instagram.com/account',
  website: 'https://example.com',
  email: 'info@example.com',
}

export default function ContactsEditor({ initial = [] }: { initial?: Contact[] }) {
  const [contacts, setContacts] = useState<Contact[]>(initial)

  useEffect(() => {
    const hidden = document.getElementById('contacts-json') as HTMLInputElement | null
    if (hidden) hidden.value = JSON.stringify(contacts)
  }, [contacts])

  const add = () => {
    setContacts((prev) => [...prev, { method_type: 'phone', value: '', is_primary: prev.length === 0 }])
  }

  const remove = (idx: number) => setContacts((prev) => prev.filter((_, i) => i !== idx))

  const update = (idx: number, patch: Partial<Contact>) => {
    setContacts((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)))
  }

  const setPrimary = (idx: number) => {
    setContacts((prev) => prev.map((c, i) => ({ ...c, is_primary: i === idx })))
  }

  return (
    <div className="ced">
      <input type="hidden" id="contacts-json" name="contacts_json" defaultValue={JSON.stringify(initial)} />

      {contacts.length === 0 && (
        <p className="ced__empty">لسه مفيش وسيلة تواصل. اضغط "إضافة" تحت.</p>
      )}

      {contacts.map((c, i) => (
        <div key={i} className="ced__row">
          <div className="ced__type">
            <PrettySelect
              value={c.method_type}
              onChange={(v) => update(i, { method_type: v as Contact['method_type'] })}
              options={TYPE_OPTIONS}
            />
          </div>

          <input
            className="admin-input ced__input"
            dir="ltr"
            placeholder={PLACEHOLDERS[c.method_type]}
            value={c.value}
            onChange={(e) => update(i, { value: e.target.value })}
          />

          <button
            type="button"
            className={`ced__primary ${c.is_primary ? 'is-on' : ''}`}
            onClick={() => setPrimary(i)}
            title="اجعله رئيسي"
            aria-label="اجعله رئيسي"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill={c.is_primary ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>

          <button
            type="button"
            className="ced__remove"
            onClick={() => remove(i)}
            aria-label="حذف"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      <button type="button" className="ced__add" onClick={add}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        إضافة وسيلة تواصل
      </button>
    </div>
  )
}
