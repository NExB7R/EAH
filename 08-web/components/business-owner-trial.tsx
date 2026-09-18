"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import TrialCountdown from './trial-countdown'
import { auditClient } from '@/lib/audit-client'

export function WhatsAppOrdersToggle({ businessId, initialEnabled }: { businessId: string; initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [busy, setBusy] = useState(false)
  const [isOwner, setIsOwner] = useState<boolean | null>(null)

  useEffect(() => {
    let alive = true
    void (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!alive) return
      if (!user) { setIsOwner(false); return }
      const { data: biz } = await supabase
        .from('businesses')
        .select('owner_profile_id')
        .eq('id', businessId)
        .maybeSingle()
      if (alive) setIsOwner(biz?.owner_profile_id === user.id)
    })()
    return () => { alive = false }
  }, [businessId])

  async function toggle() {
    if (isOwner !== true) return
    setBusy(true)
    try {
      const { createClient } = await import('@/lib/supabase-browser')
      const supabase = createClient()
      const next = !enabled
      await supabase.from('businesses').update({ accepts_whatsapp_orders: next }).eq('id', businessId)
      void auditClient({
        action: 'business.toggle_whatsapp',
        entityType: 'businesses',
        entityId: businessId,
        before: { accepts_whatsapp_orders: enabled },
        after: { accepts_whatsapp_orders: next },
      })
      setEnabled(next)
    } catch {}
    setBusy(false)
  }

  if (isOwner !== true) return null

  return (
    <section className="wa-toggle" dir="rtl">
      <div className="wa-toggle__body">
        <span className="wa-toggle__emoji"></span>
        <div className="wa-toggle__info">
          <strong>استقبال أوردرات على واتساب</strong>
          <small>{enabled ? 'شغال — العملاء يقدروا يطلبوا' : 'موقّف — مفيش أوردرات جديدة'}</small>
        </div>
        <button type="button" onClick={toggle} disabled={busy} className={`wa-toggle__btn ${enabled ? 'is-on' : ''}`}>
          {busy ? '...' : enabled ? 'إيقاف' : 'تشغيل'}
        </button>
      </div>
      <style>{`
        .wa-toggle { max-width: 1100px; margin: 14px auto; padding: 0 20px; }
        .wa-toggle__body { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-radius: 16px; background: linear-gradient(135deg, rgba(37,211,102,.06), rgba(168,85,247,.04)); border: 1px solid rgba(37,211,102,.3); }
        .wa-toggle__emoji { font-size: 1.6rem; }
        .wa-toggle__info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .wa-toggle__info strong { font-family: var(--font-cairo-play, var(--font-cairo, system-ui)); font-size: .92rem; font-weight: 900; color: #F4F2FA; }
        .wa-toggle__info small { font-family: var(--font-cairo, system-ui); font-size: .76rem; color: #A29DB5; }
        .wa-toggle__btn { padding: 8px 20px; border-radius: 10px; background: rgba(37,211,102,.15); color: #86EFAC; border: 1px solid rgba(37,211,102,.4); font-family: var(--font-cairo, system-ui); font-size: .82rem; font-weight: 900; cursor: pointer; }
        .wa-toggle__btn.is-on { background: rgba(239,68,68,.15); color: #FCA5A5; border-color: rgba(239,68,68,.4); }
      `}</style>
    </section>
  )
}

export default function BusinessOwnerTrial({ businessId }: { businessId: string }) {
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    let alive = true
    void (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !alive) return
      const { data: biz } = await supabase
        .from('businesses')
        .select('owner_profile_id')
        .eq('id', businessId)
        .maybeSingle()
      if (alive && biz?.owner_profile_id === user.id) setIsOwner(true)
    })()
    return () => { alive = false }
  }, [businessId])

  if (!isOwner) return null
  return <TrialCountdown businessId={businessId} />
}
