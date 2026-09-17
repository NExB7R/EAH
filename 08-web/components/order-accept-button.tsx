'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function OrderAcceptButton({ orderId }: { orderId: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')
  const [err, setErr] = useState<string | null>(null)

  async function accept() {
    setState('busy'); setErr(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('confirm_order', { p_order_id: orderId })
      if (error || !data?.ok) {
        setErr(data?.error ?? error?.message ?? 'فشل')
        setState('idle')
      } else {
        setState('done')
      }
    } catch (e: any) {
      setErr(e.message); setState('idle')
    }
  }

  if (state === 'done') {
    return <span className="oab oab--done">✅ تم التأكيد — العميل هيتنبه</span>
  }

  return (
    <>
      <button
        type="button"
        className="oab"
        disabled={state === 'busy'}
        onClick={accept}
      >
        {state === 'busy' ? '...' : '✋ استلمت الأوردر'}
      </button>
      {err && <span className="oab__err">⚠ {err}</span>}
      <style>{`
        .oab { padding: 8px 16px; border-radius: 10px; background: linear-gradient(135deg, #10B981, #059669); color: #fff; font-family: var(--font-cairo, system-ui); font-size: .8rem; font-weight: 900; border: none; cursor: pointer; transition: transform .2s; }
        .oab:hover:not(:disabled) { transform: translateY(-2px); }
        .oab:disabled { opacity: .5; cursor: wait; }
        .oab--done { color: #86EFAC; font-family: var(--font-cairo, system-ui); font-size: .78rem; }
        .oab__err { color: #FCA5A5; font-family: var(--font-cairo, system-ui); font-size: .72rem; margin-inline-start: 8px; }
      `}</style>
    </>
  )
}
