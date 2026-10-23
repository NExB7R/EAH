'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ClockIcon,
  AlertIcon,
  CloseIcon,
  ExternalLinkIcon,
  PhoneIcon,
  WhatsAppIcon,
  CheckCircleIcon,
} from '@/components/icons'
import { adminCancelOrder, adminExtendEta } from './actions'
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
  expected_delivery_at: string | null
  payment_method: string | null
  business_name: string
  business_slug: string
  business_id: string
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
  preparing: 'go',
  on_way: 'go',
  delivered: 'done',
  rejected: 'warn',
  cancelled: 'warn',
  expired: 'muted',
}

const PAYMENT_LABEL: Record<string, string> = {
  cash: 'عند الاستلام',
  instapay: 'InstaPay',
  wallet: 'محفظة',
}

export default function AdminOrderCard({ order }: { order: Order }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [showCancel, setShowCancel] = useState(false)
  const [showExtend, setShowExtend] = useState(false)
  const [reason, setReason] = useState('')
  const [minutes, setMinutes] = useState(15)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const isFinal = ['delivered', 'cancelled', 'rejected', 'expired'].includes(order.status)
  const tone = STATUS_TONE[order.status] ?? 'pending'

  const date = new Date(order.created_at).toLocaleString('ar-EG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const etaLabel = order.expected_delivery_at
    ? new Date(order.expected_delivery_at).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  const doCancel = () => {
    setError(null)
    startTransition(async () => {
      const res = await adminCancelOrder(order.id, reason)
      if (res.ok) {
        setShowCancel(false)
        setReason('')
        setMsg('تم الإلغاء')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  const doExtend = () => {
    setError(null)
    startTransition(async () => {
      const res = await adminExtendEta(order.id, minutes)
      if (res.ok) {
        setShowExtend(false)
        setMsg(`تم التمديد ${minutes} دقيقة`)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  const handleWhatsapp = () => {
    if (!order.customer_phone) return
    const phone = order.customer_phone.replace(/^0/, '20')
    window.open(`https://wa.me/${phone}`, '_blank')
  }

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.headLeft}>
          <span className={`${styles.status} ${styles[tone]}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
          <code className={styles.code}>#{order.order_code}</code>
        </div>
        <time className={styles.date}>{date}</time>
      </div>

      <div className={styles.cardBody}>
        <Link href={`/admin/businesses/${order.business_id}`} className={styles.bizLink}>
          <span>{order.business_name}</span>
          <ExternalLinkIcon size={10} />
        </Link>

        <p className={styles.customerName}>{order.customer_name ?? '—'}</p>
        {order.customer_phone && (
          <a href={`tel:${order.customer_phone}`} className={styles.customerPhone} dir="ltr">
            {order.customer_phone}
          </a>
        )}

        {order.items && <p className={styles.items}>{order.items}</p>}
        {order.notes && <p className={styles.notes}>📝 {order.notes}</p>}

        <div className={styles.metaRow}>
          {etaLabel && !isFinal && (
            <span className={styles.metaChip}>
              <ClockIcon size={11} />
              هيوصل {etaLabel}
            </span>
          )}
          {order.payment_method && (
            <span className={styles.metaChip}>
              {PAYMENT_LABEL[order.payment_method] ?? order.payment_method}
            </span>
          )}
        </div>
      </div>

      {msg && (
        <div className={styles.successMsg}>
          <CheckCircleIcon size={12} />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className={styles.errorMsg}>
          <AlertIcon size={12} />
          <span>{error}</span>
        </div>
      )}

      {!isFinal && (
        <div className={styles.cardActions}>
          {order.customer_phone && (
            <>
              <button
                type="button"
                onClick={handleWhatsapp}
                className={styles.actionBtn}
                aria-label="واتساب"
              >
                <WhatsAppIcon size={14} />
              </button>
              <a
                href={`tel:${order.customer_phone}`}
                className={styles.actionBtn}
                aria-label="اتصال"
              >
                <PhoneIcon size={14} />
              </a>
            </>
          )}
          <button
            type="button"
            onClick={() => setShowExtend(true)}
            disabled={pending}
            className={styles.extendBtn}
          >
            <ClockIcon size={12} />
            <span>تمديد</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCancel(true)}
            disabled={pending}
            className={styles.cancelBtn}
          >
            <CloseIcon size={12} />
            <span>إلغاء</span>
          </button>
        </div>
      )}

      {showCancel && (
        <div className={styles.inlinePanel}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={300}
            rows={2}
            placeholder="سبب الإلغاء (3-300 حرف)..."
            className={styles.textarea}
            dir="rtl"
          />
          <div className={styles.panelActions}>
            <button
              type="button"
              onClick={doCancel}
              disabled={pending || reason.trim().length < 3}
              className={styles.dangerBtn}
            >
              تأكيد الإلغاء
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCancel(false)
                setReason('')
              }}
              disabled={pending}
              className={styles.ghostBtn}
            >
              رجوع
            </button>
          </div>
        </div>
      )}

      {showExtend && (
        <div className={styles.inlinePanel}>
          <span className={styles.panelLabel}>أضف دقائق للتسليم</span>
          <div className={styles.extendsRow}>
            {[10, 15, 30, 60].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                disabled={pending}
                className={`${styles.chipBtn} ${minutes === m ? styles.chipActive : ''}`}
              >
                +{m}
              </button>
            ))}
          </div>
          <div className={styles.panelActions}>
            <button
              type="button"
              onClick={doExtend}
              disabled={pending}
              className={styles.primaryBtn}
            >
              تمديد {minutes} دقيقة
            </button>
            <button
              type="button"
              onClick={() => setShowExtend(false)}
              disabled={pending}
              className={styles.ghostBtn}
            >
              رجوع
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
