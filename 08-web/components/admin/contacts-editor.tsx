'use client'
import { useState } from 'react'
import PrettySelect from './pretty-select'
import './contacts-editor.css'
import { IcGlobe } from '@/components/eah-icons'

export type Contact = {
  method_type: 'phone' | 'whatsapp' | 'facebook' | 'instagram' | 'website' | 'email'
  value: string
  is_primary: boolean
}

const TYPE_OPTIONS = [
  { value: 'phone', label: 'فون', emoji: '' },
  { value: 'whatsapp', label: 'واتساب', emoji: '' },
  { value: 'facebook', label: 'فيسبوك', emoji: '' },
  { value: 'instagram', label: 'إنستجرام', emoji: '' },
  { value: 'website', label: 'موقع', emoji: '' },
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

  // Controlled value — مفيش DOM hacks
  const serialized = JSON.stringify(contacts)

  const add = (type: Contact['method_type'] = 'phone') => {
    setContacts((prev) => [
      ...prev,
      { method_type: type, value: '', is_primary: prev.length === 0 },
    ])
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
      {/* Controlled input */}
      <input type="hidden" name="contacts_json" value={serialized} readOnly />

      {contacts.length > 0 && (
        <div className="ced__list">
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
                title="الرئيسي"
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
        </div>
      )}

      {contacts.length === 0 && (
        <div className="ced__empty">
          <div className="ced__empty-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div className="ced__empty-text">
            <strong>لسه مفيش وسيلة تواصل</strong>
            <span>اختار من الأزرار السريعة تحت</span>
          </div>
        </div>
      )}

      <div className="ced__quick">
        <span className="ced__quick-label">إضافة سريعة:</span>
        <div className="ced__quick-btns">
          <button type="button" className="ced__quick-btn" onClick={() => add('phone')}>فون</button>
          <button type="button" className="ced__quick-btn" onClick={() => add('whatsapp')}>واتساب</button>
          <button type="button" className="ced__quick-btn" onClick={() => add('facebook')}>فيسبوك</button>
          <button type="button" className="ced__quick-btn" onClick={() => add('instagram')}>إنستجرام</button>
          <button type="button" className="ced__quick-btn" onClick={() => add('website')}><IcGlobe /> موقع</button>
          <button type="button" className="ced__quick-btn" onClick={() => add('email')}>✉️ إيميل</button>
        </div>
      </div>
    </div>
  )
}
