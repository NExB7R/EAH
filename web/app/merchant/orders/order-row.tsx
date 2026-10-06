'use client'

import { useState, useTransition } from 'react'
import { CheckCircleIcon, AlertIcon, PhoneIcon, WhatsAppIcon, ClockIcon } from '@/components/icons'
import { updateOrderStatus } from './actions'
import styles from './orders.module.css'

type Order = {
  id: string
  order_code: string
  status: string
  items: string | null
  notes: string | null
  customer_name: string | null
  customer_phone: string | null
  created_at: string
}

type Props = {
  order: Order
}

const NEXT_ACTIONS: Record<
  string,
  { status: string; label: string; tone: 'ok' | 'warn' | 'go' }[]
> = {
  sent: [
    { status: 'accepted', label: 'وافق', tone: 'ok' },
    { status: 'rejected', label: 'ارفض', tone: 'warn' },
  ],
  seen: [
    { status: 'accepted', label: 'وافق', tone: 'ok' },
    { status: 'rejected', label: 'ارفض', tone: 'warn' },
  ],
  accepted: [
    { status: 'preparing', label: 'بيتحضّر', tone: 'go' },
    { status: 'cancelled', label: 'ألغي', tone: 'warn' },
  ],
  preparing: [{ status: 'on_way', label: 'في الطريق', tone: 'go' }],
  on_way: [{ status: 'delivered', label: 'اتسلّم', tone: 'ok' }],
}

const STATUS_LABEL: Record<string, string> = {
  sent: 'جديد',
  seen: 'شافه',
  accepted: 'اتأكد',
  rejected: 'اترفض',
  preparing: 'بيتحضّر',
  on_way: 'في الطريق',
  delivered: 'اتسلّم',
  cancelled: 'اتلغى',
}

const STATUS_TONE: Record<string, string> = {
  sent: 'pending',
  seen: 'pending',
  accepted: 'ok',
  rejected: 'warn',
  preparing: 'go',
  on_way: 'go',
  delivered: 'ok',
  cancelled: 'warn',
}

export default function OrderRow({ order }: Props) {
  const [status, setStatus] = useState(order.status)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  const date = new Date(order.created_at).toLocaleString('ar-EG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const actions = NEXT_ACTIONS[status] ?? []
  const currentTone = STATUS_TONE[status] ?? 'pending'

  const handleAction = (next: string) => {
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, next)
      if (res.ok) {
        setStatus(next)
        setMsg(`تم — ${STATUS_LABEL[next] ?? next}`)
        setTimeout(() => setMsg(null), 2500)
      } else {
        setMsg(res.error)
      }
    })
  }

  const handleWhatsapp = () => {
    if (!order.customer_phone) return
    const phone = order.customer_phone.replace(/^0/, '20')
    window.open(`https://wa.me/${phone}`, '_blank')
  }

  return (
    <article className={styles.row}>
      <div className={styles.rowHead}>
        <div className={styles.rowHeadInfo}>
          <span className={`${styles.statusBadge} ${styles[currentTone]}`}>
            {STATUS_LABEL[status] ?? status}
          </span>
          <code className={styles.orderCode}>#{order.order_code}</code>
        </div>
        <time className={styles.rowDate}>
          <ClockIcon size={11} /> {date}
        </time>
      </div>

      <div className={styles.rowBody}>
        <p className={styles.customerName}>{order.customer_name ?? '—'}</p>
        {order.customer_phone && (
          <p className={styles.customerPhone} dir="ltr">
            {order.customer_phone}
          </p>
        )}
        {order.items && <p className={styles.message}>{order.items}</p>}
      </div>

      <div className={styles.rowActions}>
        {order.customer_phone && (
          <>
            <button type="button" onClick={handleWhatsapp} className={styles.actionBtn}>
              <WhatsAppIcon size={12} />
              <span>واتساب</span>
            </button>
            <a href={`tel:${order.customer_phone}`} className={styles.actionBtn}>
              <PhoneIcon size={12} />
              <span>اتصال</span>
            </a>
          </>
        )}

        {actions.map((a) => (
          <button
            key={a.status}
            type="button"
            onClick={() => handleAction(a.status)}
            disabled={pending}
            className={`${styles.actionBtn} ${styles[`action_${a.tone}`]}`}
          >
            {a.tone === 'ok' && <CheckCircleIcon size={12} />}
            {a.tone === 'warn' && <AlertIcon size={12} />}
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      {msg && <p className={styles.rowMsg}>{msg}</p>}
    </article>
  )
}
