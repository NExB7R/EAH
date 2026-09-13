'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './notifications-panel.css'

type NotifType = {
  key: string
  label: string
  description: string | null
  emoji: string
  role_scope: string
  default_enabled: boolean
  is_globally_active: boolean
  sort_order: number
}

export default function NotificationsPanel({
  types,
  initialPrefs,
  role,
  adminMode = false,
}: {
  types: NotifType[]
  initialPrefs: Record<string, boolean>
  role: 'customer' | 'merchant' | 'admin'
  adminMode?: boolean
}) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {}
    types.forEach(t => { defaults[t.key] = initialPrefs[t.key] ?? t.default_enabled })
    return defaults
  })
  const [saving, setSaving] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [globalState, setGlobalState] = useState<Record<string, boolean>>(() => {
    const s: Record<string, boolean> = {}
    types.forEach(t => { s[t.key] = t.is_globally_active })
    return s
  })

  async function toggle(key: string) {
    const next = !prefs[key]
    setPrefs(p => ({ ...p, [key]: next }))
    setSaving(key)
    const supabase = createClient()
    await supabase.rpc('toggle_notif_pref', { p_key: key, p_enabled: next })
    setSaving(null)
    setSavedAt(new Date())
  }

  async function toggleGlobal(key: string) {
    const next = !globalState[key]
    setGlobalState(g => ({ ...g, [key]: next }))
    const supabase = createClient()
    await supabase.from('notification_types').update({ is_globally_active: next }).eq('key', key)
  }

  const roleLabel = {
    customer: '🔔 إشعارات العميل',
    merchant: '🔔 إشعارات التاجر',
    admin: '🛡️ إشعارات الأدمن',
  }[role]

  return (
    <section className="np2">
      <header className="np2__head">
        <div>
          <h2 className="np2__title">{roleLabel}</h2>
          <p className="np2__sub">
            {adminMode
              ? 'تحكم كامل في إشعارات المنصة — من يراها ومتى'
              : 'اختر ما يهمك — لا إزعاج'}
          </p>
        </div>
        {savedAt && (
          <span className="np2__status">
            ✓ محفوظ {savedAt.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </header>

      <div className="np2__list">
        {types.map(t => (
          <div key={t.key} className={`np2__item ${!globalState[t.key] ? 'is-disabled' : ''}`}>
            <div className="np2__item-body">
              <span className="np2__item-emoji">{t.emoji}</span>
              <div className="np2__item-text">
                <span className="np2__item-label">{t.label}</span>
                {t.description && <span className="np2__item-desc">{t.description}</span>}
              </div>
            </div>

            <div className="np2__item-actions">
              {adminMode && (
                <button
                  type="button"
                  className={`np2__global ${globalState[t.key] ? 'is-on' : ''}`}
                  onClick={() => toggleGlobal(t.key)}
                  title={globalState[t.key] ? 'متاح للمستخدمين' : 'موقوف من الأدمن'}
                >
                  {globalState[t.key] ? '🌐 عام' : '🚫 موقوف'}
                </button>
              )}

              <button
                type="button"
                className={`np2__toggle ${prefs[t.key] ? 'is-on' : ''}`}
                onClick={() => toggle(t.key)}
                disabled={saving === t.key || (adminMode && !globalState[t.key])}
                role="switch"
                aria-checked={prefs[t.key]}
              >
                <span className="np2__toggle-thumb" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {types.length === 0 && (
        <div className="np2__empty">مفيش أنواع إشعارات متاحة</div>
      )}
    </section>
  )
}
