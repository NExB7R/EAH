'use client'
import { useState } from 'react'
import './business-contact.css'

type ContactMethod = {
  method_type: string
  value: string
  is_primary: boolean
}

const METHOD_EMOJI: Record<string, string> = {
  phone: '📞',
  whatsapp: '💬',
  facebook: '📘',
  instagram: '📷',
  website: '🌐',
  email: '✉️',
}

const METHOD_LABEL: Record<string, string> = {
  phone: 'اتصال',
  whatsapp: 'واتساب',
  facebook: 'فيسبوك',
  instagram: 'إنستجرام',
  website: 'الموقع',
  email: 'إيميل',
}

export default function BusinessContact({
  businessId,
  contacts,
}: {
  businessId: string
  contacts: ContactMethod[]
}) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  const reveal = async (method: ContactMethod) => {
    setRevealed((prev) => ({ ...prev, [method.method_type]: true }))

    // نُسجّل الزيارة الفريدة
    try {
      await fetch('/api/track-reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          method_type: method.method_type,
        }),
      })
    } catch {
      /* صامت */
    }
  }

  if (contacts.length === 0) {
    return (
      <section className="bcontact bcontact--empty">
        <h2 className="bcontact__title">التواصل</h2>
        <p className="bcontact__empty-msg">
          أرقام التواصل هتظهر قريب. في الوقت الحالي، استخدم زرار الحفظ لمتابعة المكان.
        </p>
      </section>
    )
  }

  return (
    <section className="bcontact">
      <h2 className="bcontact__title">
        <span className="bcontact__title-icon">📞</span>
        التواصل
      </h2>
      <p className="bcontact__hint">
        ✋ دوس على الزرار عشان تظهر البيانات — ده بيتحسب كزيارة فريدة للمكان.
      </p>

      <div className="bcontact__list">
        {contacts.map((c) => {
          const isRevealed = revealed[c.method_type]
          const label = METHOD_LABEL[c.method_type] ?? c.method_type
          const emoji = METHOD_EMOJI[c.method_type] ?? '📌'

          const href =
            c.method_type === 'phone'
              ? `tel:${c.value}`
              : c.method_type === 'whatsapp'
              ? `https://wa.me/${c.value.replace(/\D/g, '')}`
              : c.method_type === 'email'
              ? `mailto:${c.value}`
              : c.value

          return (
            <div
              key={c.method_type}
              className={`bcontact__item ${isRevealed ? 'is-revealed' : ''} ${
                c.is_primary ? 'is-primary' : ''
              }`}
            >
              <div className="bcontact__item-head">
                <span className="bcontact__emoji">{emoji}</span>
                <span className="bcontact__label">{label}</span>
                {c.is_primary && <span className="bcontact__primary">رئيسي</span>}
              </div>

              {isRevealed ? (
                <a href={href} target="_blank" rel="noreferrer" className="bcontact__value">
                  {c.value}
                </a>
              ) : (
                <button
                  type="button"
                  className="bcontact__reveal"
                  onClick={() => reveal(c)}
                >
                  <span className="bcontact__hidden">•••••••••••</span>
                  <span className="bcontact__reveal-text">اكشف الرقم</span>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
