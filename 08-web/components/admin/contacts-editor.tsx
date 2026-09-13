'use client'
import { useState, useEffect } from 'react'

export type Contact = {
  method_type: 'phone' | 'whatsapp' | 'facebook' | 'instagram' | 'website' | 'email'
  value: string
  is_primary: boolean
}

const TYPE_OPTIONS = [
  { value: 'phone', label: '📞 فون' },
  { value: 'whatsapp', label: '💬 واتساب' },
  { value: 'facebook', label: '📘 فيسبوك' },
  { value: 'instagram', label: '📷 إنستجرام' },
  { value: 'website', label: '🌐 موقع' },
  { value: 'email', label: '✉️ إيميل' },
] as const

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input type="hidden" id="contacts-json" name="contacts_json" defaultValue={JSON.stringify(initial)} />

      {contacts.length === 0 && (
        <p style={{ fontSize: '0.78rem', color: 'var(--eah-text-3)', margin: 0 }}>
          لسه مفيش وسيلة تواصل. اضغط "إضافة" تحت.
        </p>
      )}

      {contacts.map((c, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '130px 1fr auto auto',
            gap: 8,
            alignItems: 'center',
            padding: 10,
            borderRadius: 'var(--eah-radius)',
            background: 'rgba(10,8,18,0.4)',
            border: '1px solid var(--eah-border)',
          }}
        >
          <select
            className="admin-select"
            value={c.method_type}
            onChange={(e) => update(i, { method_type: e.target.value as Contact['method_type'] })}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <input
            className="admin-input"
            dir="ltr"
            placeholder={PLACEHOLDERS[c.method_type]}
            value={c.value}
            onChange={(e) => update(i, { value: e.target.value })}
          />

          <button
            type="button"
            className={`admin-btn admin-btn--sm ${c.is_primary ? 'admin-btn--gold' : ''}`}
            onClick={() => setPrimary(i)}
            title="اجعله رئيسي"
          >
            {c.is_primary ? '⭐' : '☆'}
          </button>

          <button
            type="button"
            className="admin-btn admin-btn--sm admin-btn--danger"
            onClick={() => remove(i)}
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        className="admin-btn admin-btn--sm"
        onClick={add}
        style={{ alignSelf: 'flex-start' }}
      >
        ➕ إضافة وسيلة تواصل
      </button>
    </div>
  )
}
