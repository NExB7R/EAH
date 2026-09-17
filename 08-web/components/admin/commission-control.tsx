'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { IcCheckCircle } from '@/components/eah-icons'

export default function CommissionControl({ businessId }: { businessId: string }) {
  const [percent, setPercent] = useState(0)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    void (async () => {
      const { data } = await supabase
        .from('business_commissions')
        .select('commission_percent,notes')
        .eq('business_id', businessId)
        .maybeSingle()
      if (data) {
        setPercent(Number(data.commission_percent ?? 0))
        setNotes(data.notes ?? '')
      }
    })()
  }, [businessId])

  async function save() {
    setBusy(true); setMsg(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('set_business_commission', {
        p_business_id: businessId,
        p_percent: percent,
        p_notes: notes || null,
      })
      if (error || !data?.ok) setMsg('خطأ: ' + (data?.error ?? error?.message))
      else setMsg('تم الحفظ')
    } catch (e: any) { setMsg('خطأ: ' + e.message) }
    setBusy(false)
  }

  return (
    <div className="comm">
      <div className="comm__head">
        <span className="comm__emoji">💰</span>
        <div>
          <h3 className="comm__title">عمولة المنصة</h3>
          <p className="comm__desc">النسبة اللي EAH بتاخدها من كل أوردر</p>
        </div>
      </div>
      <div className="comm__row">
        <input type="number" min={0} max={100} step={0.5} value={percent} onChange={(e) => setPercent(Number(e.target.value))} className="comm__input" />
        <span className="comm__unit">%</span>
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات (اختياري)" className="comm__input comm__input--notes" />
        <button type="button" onClick={save} disabled={busy} className="comm__btn">{busy ? '...' : 'حفظ'}</button>
      </div>
      {msg && <p className={msg.startsWith('') ? 'comm__ok' : 'comm__err'}>{msg}</p>}
      <style>{`
        .comm { padding: 20px; border-radius: 16px; background: rgba(232,199,154,.04); border: 1px solid rgba(232,199,154,.25); margin-top: 20px; }
        .comm__head { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
        .comm__emoji { font-size: 1.6rem; }
        .comm__title { font-family: var(--font-cairo-play, var(--font-cairo, system-ui)); font-size: 1.05rem; font-weight: 900; color: #F4F2FA; margin: 0 0 4px; }
        .comm__desc { font-family: var(--font-cairo, system-ui); font-size: .78rem; color: #A29DB5; margin: 0; }
        .comm__row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .comm__input { width: 100px; padding: 10px 14px; border-radius: 10px; background: rgba(7,6,11,.6); border: 1px solid rgba(168,85,247,.3); color: #F4F2FA; font-family: var(--font-cairo, system-ui); font-size: .95rem; font-weight: 900; text-align: center; outline: none; }
        .comm__input--notes { width: auto; flex: 1; min-width: 140px; text-align: start; font-weight: 400; }
        .comm__unit { font-family: var(--font-cairo, system-ui); font-size: .9rem; color: #E8C79A; font-weight: 900; }
        .comm__btn { padding: 10px 20px; border-radius: 10px; background: linear-gradient(135deg, #E8C79A, #A67C52); color: #1A0F0A; font-family: var(--font-cairo, system-ui); font-size: .82rem; font-weight: 900; border: none; cursor: pointer; }
        .comm__btn:hover:not(:disabled) { transform: translateY(-2px); }
        .comm__ok { font-family: var(--font-cairo, system-ui); font-size: .82rem; color: #86EFAC; margin: 10px 0 0; }
        .comm__err { font-family: var(--font-cairo, system-ui); font-size: .82rem; color: #FCA5A5; margin: 10px 0 0; }
      `}</style>
    </div>
  )
}
