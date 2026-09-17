'use client'
import { useState, useTransition } from 'react'
import { updateOrderStatus } from '../actions'
import { IcBan, IcEye } from '@/components/eah-icons'

type Status = 'sent' | 'seen' | 'accepted' | 'rejected' | 'delivered' | 'cancelled'

const ACTIONS: { key: Status; label: string; icon: React.ReactNode; variant: string }[] = [
  { key: 'seen', label: 'شفته', icon: <IcEye />, variant: 'ghost' },
  { key: 'accepted', label: 'قبلت', icon: null, variant: 'primary' },
  { key: 'delivered', label: 'تم التسليم', icon: null, variant: 'primary' },
  { key: 'rejected', label: 'رفضت', icon: null, variant: 'danger' },
  { key: 'cancelled', label: 'ملغي', icon: <IcBan />, variant: 'ghost' },
]

export default function OrderStatusButtons({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: Status
}) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  function run(status: Status) {
    start(async () => {
      // call confirm_order RPC first (sends notification to customer)
      if (status === 'accepted') {
        try {
          const { createClient } = await import('@/lib/supabase-browser')
          const supabase = createClient()
          await supabase.rpc('confirm_order', { p_order_id: orderId })
        } catch { /* silent */ }
      }
      const r = await updateOrderStatus(orderId, status)
      setMsg(r.ok ? 'OK' : r.error || 'error')
      setTimeout(() => setMsg(null), 2400)
    })
  }

  const available = ACTIONS.filter((a) => {
    if (currentStatus === 'sent') return true
    if (currentStatus === 'seen') return a.key !== 'seen'
    if (currentStatus === 'accepted') return ['delivered', 'cancelled'].includes(a.key)
    if (['delivered', 'rejected', 'cancelled'].includes(currentStatus)) return false
    return true
  })

  if (available.length === 0) return null

  return (
    <div className="osb">
      {available.map((a) => (
        <button
          key={a.key}
          type="button"
          className={'osb__btn osb__btn--' + a.variant}
          onClick={() => run(a.key)}
          disabled={pending}
        >
          {a.icon} {a.label}
        </button>
      ))}
      {msg && <span className="osb__msg">{msg}</span>}
    </div>
  )
}
