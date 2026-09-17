'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function SettingsClient({ initial }: { initial: Record<string, any> }) {
  const [trialDays, setTrialDays] = useState(Number(initial.trial_days ?? 30))
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function save() {
    setBusy(true); setMsg(null)
    try {
      const supabase = createClient()
      const { error: e1 } = await supabase
        .from('platform_settings')
        .upsert({ key: 'trial_days', value: JSON.stringify(trialDays) }, { onConflict: 'key' })
      const { error: e2 } = await supabase
        .from('platform_settings')
        .upsert({ key: 'trial_days_display', value: JSON.stringify(`${trialDays} يوم`) }, { onConflict: 'key' })
      if (e1 || e2) setMsg('خطأ: ' + (e1?.message ?? e2?.message))
      else setMsg('تم الحفظ — التطبيق في كل مكان')
    } catch (e: any) {
      setMsg('خطأ: ' + e.message)
    }
    setBusy(false)
  }

  return (
    <div className="settings__body">
      <section className="settings__card">
        <div className="settings__card-head">
          <span className="settings__card-emoji"></span>
          <div>
            <h2 className="settings__card-title">مدة التجربة المجانية</h2>
            <p className="settings__card-desc">
              بتتطبق تلقائي على كل نشاط جديد — وتظهر في كل الصفحات
            </p>
          </div>
        </div>
        <div className="settings__input-row">
          <input
            type="number"
            min={1}
            max={365}
            value={trialDays}
            onChange={(e) => setTrialDays(Number(e.target.value))}
            className="settings__input"
          />
          <span className="settings__input-unit">يوم</span>
        </div>
        <p className="settings__hint">
          مثال: لو غيّرتها لـ 15 يوم، كل الصفحات هتقول "تجربة 15 يوم" تلقائي.
        </p>
      </section>

      <div className="settings__actions">
        <button type="button" onClick={save} disabled={busy} className="settings__submit">
          {busy ? '...' : '💾 حفظ الإعدادات'}
        </button>
        {msg && <p className={msg.startsWith('') ? 'settings__ok' : 'settings__err'}>{msg}</p>}
      </div>
    </div>
  )
}
