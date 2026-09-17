'use client'
import { useState, useEffect } from 'react'
import { getClientToken } from '@/lib/admin/visitor-hash'
import { createClient } from '@/lib/supabase-browser'
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
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [needsAuth, setNeedsAuth] = useState(false)

  useEffect(() => {
    let alive = true
    void (async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (alive) setNeedsAuth(!user)
      } catch {
        /* silent */
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const reveal = async (method: ContactMethod) => {
    if (needsAuth) {
      const next = typeof window !== 'undefined' ? window.location.pathname : '/'
      window.location.href = `/auth?next=${encodeURIComponent(next)}`
      return
    }

    setLoading((p) => ({ ...p, [method.method_type]: true }))

    try {
      const client_token = getClientToken()
      await fetch('/api/reveal-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          method_type: method.method_type,
          client_token,
        }),
      })
    } catch {
      /* silent */
    }

    setRevealed((prev) => ({ ...prev, [method.method_type]: true }))
    setLoading((p) => ({ ...p, [method.method_type]: false }))
  }

  if (contacts.length === 0) {
    return (
      <section className="bcontact bcontact--empty">
        <h2 className="bcontact__title">
          <span className="bcontact__title-icon">📞</span>
          التواصل
        </h2>
        <p className="bcontact__empty-msg">أرقام التواصل هتظهر قريب.</p>
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
        سجّل مرة واحدة وشوف كل الأرقام — بدون أي رسوم أو تعقيد.
      </p>

      <div className="bcontact__list">
        {contacts.map((c) => {
          const isRevealed = revealed[c.method_type]
          const isLoading = loading[c.method_type]
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
                  disabled={isLoading}
                  title={needsAuth ? 'سجّل عشان تكشف الرقم' : undefined}
                >
                  <span className="bcontact__hidden">•••••••••••</span>
                  <span className="bcontact__reveal-text">
                    {isLoading ? '...' : needsAuth ? 'سجّل عشان تكشف' : 'اكشف الرقم'}
                  </span>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
