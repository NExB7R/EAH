'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './notification-preferences.css'

const PREFS = [
  { key: 'review_new',       emoji: '⭐', label: 'تقييم جديد',           desc: 'لما حد يقيّم نشاطك' },
  { key: 'reveal_new',       emoji: '📞', label: 'كشف رقم',              desc: 'لما حد يكشف رقمك' },
  { key: 'offer_approved',   emoji: '🎁', label: 'عرض اتنشر',            desc: 'لما الإدارة توافق على عرض' },
  { key: 'points_earned',    emoji: '💰', label: 'نقاط جديدة',           desc: 'لما تكسب نقاط' },
  { key: 'streak_reminder',  emoji: '🔥', label: 'تنبيه Streak',         desc: 'لما يحتمل streak ينكسر' },
  { key: 'system_updates',   emoji: '⚙️', label: 'تحديثات النظام',      desc: 'أخبار وتغييرات المنصة' },
  { key: 'marketing',        emoji: '📢', label: 'رسائل تسويقية',       desc: 'عروض وباقات داخلية' },
  { key: 'email_digest',     emoji: '✉️', label: 'ملخص أسبوعي',         desc: 'ملخص على الإيميل' },
]

export default function NotificationPreferences({
  initial,
}: {
  initial: Record<string, boolean>
}) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(initial)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  function toggle(key: string) {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    save(next)
  }

  async function save(next: Record<string, boolean>) {
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase.rpc('update_notif_prefs', { p_prefs: next })
    setSaving(false)
    if (!error && (data as any)?.ok) {
      setSavedAt(new Date())
    }
  }

  function toggleAll(value: boolean) {
    const next = Object.fromEntries(Object.keys(prefs).map(k => [k, value]))
    setPrefs(next)
    save(next)
  }

  return (
    <section className="np">
      <header className="np__head">
        <div>
          <h2 className="np__title">🔔 إعدادات الإشعارات</h2>
          <p className="np__sub">تحكم في إيه اللي يوصلك من EAH</p>
        </div>
        <div className="np__actions">
          <button className="np__bulk-btn" onClick={() => toggleAll(true)}>تفعيل الكل</button>
          <button className="np__bulk-btn np__bulk-btn--ghost" onClick={() => toggleAll(false)}>إيقاف الكل</button>
        </div>
      </header>

      <div className="np__list">
        {PREFS.map(p => (
          <div key={p.key} className="np__item">
            <div className="np__item-body">
              <span className="np__item-emoji">{p.emoji}</span>
              <div className="np__item-text">
                <span className="np__item-label">{p.label}</span>
                <span className="np__item-desc">{p.desc}</span>
              </div>
            </div>
            <button
              type="button"
              className={`np__toggle ${prefs[p.key] ? 'is-on' : ''}`}
              onClick={() => toggle(p.key)}
              aria-label={prefs[p.key] ? 'إيقاف' : 'تفعيل'}
              role="switch"
              aria-checked={prefs[p.key]}
            >
              <span className="np__toggle-thumb" />
            </button>
          </div>
        ))}
      </div>

      <div className="np__foot">
        {saving && <span className="np__status">💾 جاري الحفظ...</span>}
        {!saving && savedAt && <span className="np__status np__status--ok">✓ محفوظ {savedAt.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
    </section>
  )
}
