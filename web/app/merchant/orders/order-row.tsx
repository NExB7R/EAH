'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { CheckCircleIcon, AlertIcon, PhoneIcon, WhatsAppIcon, ClockIcon, ShieldCheckIcon } from '@/components/icons'
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
  buyerAccountLinked: boolean
  buyerPhoneVerified: boolean | null
  buyerCompletedOrders: number | null
}

const COUNTDOWN_MS = 10 * 60 * 1000

function Countdown({ createdAt }: { createdAt: string }) {
  const deadline = new Date(createdAt).getTime() + COUNTDOWN_MS
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const remaining = deadline - now
  if (remaining <= 0) {
    return (
      <span className={styles.countdownExpired}>
        <ClockIcon size={12} />
        <span>فات الوقت</span>
      </span>
    )
  }

  const totalSec = Math.floor(remaining / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  const urgent = totalSec < 120

  return (
    <span className={urgent ? styles.countdownUrgent : styles.countdown}>
      <ClockIcon size={12} />
      <span>
        {min}:{String(sec).padStart(2, '0')}
      </span>
    </span>
  )
}

function Elapsed({ since }: { since: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])
  const sec = Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000))
  const min = Math.floor(sec / 60)
  const label = min < 60 ? `${min} د` : `${Math.floor(min / 60)} س`
  return (
    <span className={styles.elapsed}>
      <ClockIcon size={12} />
      <span>{label}</span>
    </span>
  )
}

type Props = {
  order: Order
  isHighlighted?: boolean
}

const NEXT_ACTIONS: Record<
  string,
  { status: string; label: string; tone: 'ok' | 'warn' | 'go'; confirm?: boolean }[]
> = {
  sent: [
    { status: 'accepted', label: 'موافق', tone: 'ok' },
    { status: 'rejected', label: 'رفض', tone: 'warn', confirm: true },
  ],
  seen: [
    { status: 'accepted', label: 'موافق', tone: 'ok' },
    { status: 'rejected', label: 'رفض', tone: 'warn', confirm: true },
  ],
  accepted: [
    { status: 'preparing', label: 'بيتحضّر', tone: 'go' },
    { status: 'cancelled', label: 'إلغاء', tone: 'warn', confirm: true },
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
  expired: 'فات الوقت',
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
  expired: 'muted',
}

export default function OrderRow({ order, isHighlighted = false }: Props) {
  const [status, setStatus] = useState(order.status)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (isHighlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isHighlighted])

  const date = new Date(order.created_at).toLocaleString('ar-EG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const actions = NEXT_ACTIONS[status] ?? []
  const currentTone = STATUS_TONE[status] ?? 'pending'
  const isUrgent = status === 'sent' || status === 'seen'
  const isInProgress = ['accepted', 'preparing', 'on_way'].includes(status)

  const handleAction = (next: string, needsConfirm: boolean, label: string) => {
    if (needsConfirm && !confirm(`${label} الطلب #${order.order_code}؟`)) return
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
    <article
      ref={ref}
      className={`${styles.row} ${isHighlighted ? styles.rowHighlight : ''}`}
      aria-current={isHighlighted ? 'true' : undefined}
    >
      <div className={styles.rowHead}>
        <div className={styles.rowHeadLeft}>
          <span className={`${styles.statusBadge} ${styles[currentTone]}`}>
            {STATUS_LABEL[status] ?? status}
          </span>
          <code className={styles.orderCode}>#{order.order_code}</code>
        </div>
        <div className={styles.rowHeadRight}>
          {isUrgent && <Countdown createdAt={order.created_at} />}
          {isInProgress && order.created_at && <Elapsed since={order.created_at} />}
          <time className={styles.rowDate}>{date}</time>
        </div>
      </div>

      <div className={styles.rowBody}>
        <p className={styles.customerName}>{order.customer_name ?? '—'}</p>
        <div className={styles.buyerSignals} aria-label="معلومات مرتبطة بالحساب في هذا الطلب">
          {!order.buyerAccountLinked ? (
            <span className={styles.buyerSignalNeutral}>طلب ضيف — لا يوجد حساب EAH مرتبط</span>
          ) : (
            <>
              <span className={order.buyerPhoneVerified === true ? `${styles.buyerSignal} ${styles.buyerSignalVerified}` : `${styles.buyerSignal} ${styles.buyerSignalNeutral}`}>
                {order.buyerPhoneVerified === true && <ShieldCheckIcon size={12} />}
                {order.buyerPhoneVerified === null
                  ? 'تعذّر التحقق من حالة الهاتف مؤقتًا'
                  : order.buyerPhoneVerified ? 'الهاتف موثّق' : 'الهاتف لم يتم توثيقه'}
              </span>
              <span className={styles.buyerSignalNeutral}>
                {order.buyerCompletedOrders === null
                  ? 'تعذّر تحميل سجل الطلبات مؤقتًا'
                  : order.buyerCompletedOrders > 0
                    ? `${order.buyerCompletedOrders.toLocaleString('ar-EG')} طلب مكتمل على EAH`
                    : 'لا يوجد سجل طلبات مكتملة كافٍ بعد'}
              </span>
            </>
          )}
        </div>
        {order.customer_phone && (
          <a href={`tel:${order.customer_phone}`} className={styles.customerPhone} dir="ltr">
            {order.customer_phone}
          </a>
        )}
        {order.items && <p className={styles.message}>{order.items}</p>}
        {order.notes && <p className={styles.notes}>📝 {order.notes}</p>}
      </div>

      <div className={styles.rowActions}>
        {order.customer_phone && (
          <>
            <button
              type="button"
              onClick={handleWhatsapp}
              className={`${styles.actionBtn} ${styles.actionContact}`}
              aria-label="واتساب"
            >
              <WhatsAppIcon size={16} />
              <span>واتساب</span>
            </button>
            <a
              href={`tel:${order.customer_phone}`}
              className={`${styles.actionBtn} ${styles.actionContact}`}
            >
              <PhoneIcon size={16} />
              <span>اتصال</span>
            </a>
          </>
        )}
      </div>

      {actions.length > 0 && (
        <div className={styles.rowPrimaryActions}>
          {actions.map((a) => (
            <button
              key={a.status}
              type="button"
              onClick={() => handleAction(a.status, !!a.confirm, a.label)}
              disabled={pending}
              className={`${styles.primaryAction} ${styles[`action_${a.tone}`]}`}
            >
              {a.tone === 'ok' && <CheckCircleIcon size={18} />}
              {a.tone === 'warn' && <AlertIcon size={18} />}
              <span>{pending ? '…' : a.label}</span>
            </button>
          ))}
        </div>
      )}

      {msg && <p className={styles.rowMsg}>{msg}</p>}
    </article>
  )
}
