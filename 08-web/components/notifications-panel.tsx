'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './notification-preferences.css'

type TypeRow = {
  key: string
  label: string
  description: string | null
  emoji: string | null
  role_scope: string
  default_enabled: boolean
  sort_order: number | null
  is_globally_active: boolean
  is_premium_only: boolean | null
}

type Props = {
  types: TypeRow[]
  initialPrefs: Record<string, boolean>
  role: 'customer' | 'merchant' | 'super_admin'
  isPremium?: boolean
  /** وضع الأدمن — يخفي ساعات الهدوء ويعرض نطاق كل الأدوار */
  adminMode?: boolean
}

type QuietHours = {
  enabled: boolean
  from: string
  to: string
}

export default function NotificationsPanel({
  types,
  initialPrefs,
  role,
  isPremium = false,
  adminMode = false,
}: Props) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(initialPrefs)
  const [quiet, setQuiet] = useState<QuietHours>({
    enabled: false,
    from: '22:00',
    to: '08:00',
  })
  const [pending, start] = useTransition()
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  // فلاتر حسب الباقة
  const visible = types.filter((t) => {
    if (!t.is_globally_active) return false
    if (t.is_premium_only && !isPremium) return false
    return true
  })

  function toggle(key: string) {
    setPrefs((p) => ({ ...p, [key]: !(p[key] ?? true) }))
  }

  function save() {
    start(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStatus('error')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          notif_prefs: prefs,
          notif_quiet_hours: quiet,
        })
        .eq('id', user.id)

      if (error) {
        setStatus('error')
      } else {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 2400)
      }
    })
  }

  return (
    <div className="np">
      {/* Status banner */}
      {role === 'merchant' && !isPremium && (
        <div className="np__banner np__banner--info">
          <span className="np__banner-emoji">💎</span>
          <div>
            <strong>باقة مميزة بتفتح إشعارات إضافية</strong>
            <p>اشترك للحصول على إشعارات فورية بالتقييمات، العروض الجديدة، وتفاصيل أعمق عن أداء نشاطك.</p>
          </div>
        </div>
      )}

      {/* Types */}
      <div className="np__types">
        {visible.map((t) => {
          const enabled = prefs[t.key] ?? t.default_enabled
          return (
            <label key={t.key} className="np__row">
              <div className="np__info">
                <span className="np__emoji">{t.emoji ?? '🔔'}</span>
                <div className="np__text">
                  <span className="np__label">{t.label}</span>
                  {t.description && (
                    <span className="np__desc">{t.description}</span>
                  )}
                  {t.is_premium_only && (
                    <span className="np__badge">💎 مميز</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className={`np__switch ${enabled ? 'is-on' : ''}`}
                onClick={() => toggle(t.key)}
                aria-pressed={enabled}
                aria-label={t.label}
              >
                <span className="np__switch-thumb" />
              </button>
            </label>
          )
        })}
      </div>

      {/* Quiet hours — مخفية في adminMode */}
      {!adminMode && (
      <div className="np__section">
        <h3 className="np__section-title">
          <span>🌙</span>
          ساعات الهدوء
        </h3>
        <p className="np__section-sub">
          مش بنبعت إشعارات في الفترة دي — حتى لو مفعّلة.
        </p>

        <label className="np__row">
          <div className="np__info">
            <span className="np__emoji">🌙</span>
            <span className="np__text">
              <span className="np__label">تفعيل ساعات الهدوء</span>
            </span>
          </div>
          <button
            type="button"
            className={`np__switch ${quiet.enabled ? 'is-on' : ''}`}
            onClick={() => setQuiet((q) => ({ ...q, enabled: !q.enabled }))}
            aria-pressed={quiet.enabled}
          >
            <span className="np__switch-thumb" />
          </button>
        </label>

        {quiet.enabled && (
          <div className="np__quiet-times">
            <label className="np__time">
              <span>من</span>
              <input
                type="time"
                value={quiet.from}
                onChange={(e) => setQuiet((q) => ({ ...q, from: e.target.value }))}
              />
            </label>
            <label className="np__time">
              <span>إلى</span>
              <input
                type="time"
                value={quiet.to}
                onChange={(e) => setQuiet((q) => ({ ...q, to: e.target.value }))}
              />
            </label>
          </div>
        )}
      </div>
      )}

      {/* Save */}
      <div className="np__footer">
        <button
          type="button"
          className="np__save"
          onClick={save}
          disabled={pending}
        >
          {pending ? '...' : 'حفظ التفضيلات'}
        </button>
        {status === 'saved' && (
          <span className="np__status np__status--ok">✓ تم الحفظ</span>
        )}
        {status === 'error' && (
          <span className="np__status np__status--err">⚠ فشل الحفظ</span>
        )}
      </div>
    </div>
  )
}
