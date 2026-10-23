'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MapPinIcon, ClockIcon, SearchIcon, CloseIcon, StoreIcon } from '@/components/icons'
import FeedbackForm from './feedback-form'
import styles from './orders.module.css'

// ═══════════════════════════════════════════════════════════════════
// Customer Orders List — mobile-first with filters + search
// ═══════════════════════════════════════════════════════════════════

type OrderBusiness = {
  name: string
  slug: string
  area: string | null
}

type Order = {
  id: string
  order_code: string
  status: string
  created_at: string
  business: OrderBusiness | null
  delivered_at: string | null
  feedback_rating: number | null
  feedback_issue_type: string | null
  feedback_due_at: string | null
  expected_delivery_at: string | null
}

type Props = { orders: Order[] }

type StatusMeta = { label: string; tone: string; step: number }

const STATUS_META: Record<string, StatusMeta> = {
  sent: { label: 'في الانتظار', tone: 'pending', step: 1 },
  seen: { label: 'شافه النشاط', tone: 'pending', step: 2 },
  accepted: { label: 'اتأكد', tone: 'ok', step: 3 },
  preparing: { label: 'بيتحضّر', tone: 'go', step: 4 },
  on_way: { label: 'في الطريق', tone: 'go', step: 5 },
  delivered: { label: 'اتسلّم', tone: 'done', step: 6 },
  rejected: { label: 'اترفض', tone: 'bad', step: 0 },
  cancelled: { label: 'اتلغى', tone: 'bad', step: 0 },
  expired: { label: 'فات الوقت', tone: 'bad', step: 0 },
}

const STEPS = [
  { step: 1, label: 'طلب' },
  { step: 2, label: 'شافه' },
  { step: 3, label: 'وافق' },
  { step: 4, label: 'تحضير' },
  { step: 5, label: 'توصيل' },
  { step: 6, label: 'تم' },
]

const ACTIVE_STATUSES = ['sent', 'seen', 'accepted', 'preparing', 'on_way']

const FILTERS = [
  { key: 'all', label: 'الكل' },
  { key: 'active', label: 'النشطة' },
  { key: 'delivered', label: 'المكتملة' },
  { key: 'cancelled', label: 'المرفوضة' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

export default function OrdersList({ orders }: Props) {
  // Computed once at mount — safe from React purity rule
  const [nowMs] = useState(() => Date.now())
  const [filter, setFilter] = useState<FilterKey>('all')
  const [q, setQ] = useState('')

  const counts = useMemo(() => {
    return {
      all: orders.length,
      active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter(
        (o) => o.status === 'rejected' || o.status === 'cancelled' || o.status === 'expired',
      ).length,
    }
  }, [orders])

  const filtered = useMemo(() => {
    let result = orders

    if (filter === 'active') {
      result = result.filter((o) => ACTIVE_STATUSES.includes(o.status))
    } else if (filter === 'delivered') {
      result = result.filter((o) => o.status === 'delivered')
    } else if (filter === 'cancelled') {
      result = result.filter(
        (o) => o.status === 'rejected' || o.status === 'cancelled' || o.status === 'expired',
      )
    }

    const query = q.trim().toLowerCase()
    if (query) {
      result = result.filter(
        (o) =>
          o.order_code.toLowerCase().includes(query) ||
          (o.business?.name ?? '').toLowerCase().includes(query),
      )
    }

    return result
  }, [orders, filter, q])

  return (
    <>
      <div className={styles.searchWrap}>
        <SearchIcon size={16} className={styles.searchIcon} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث برقم الطلب أو اسم النشاط..."
          className={styles.searchInput}
          dir="rtl"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            className={styles.searchClear}
            aria-label="مسح"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
          >
            <span>{f.label}</span>
            <span className={styles.filterCount}>{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyFilter}>
          <p>مفيش طلبات في الفئة دي</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {filtered.map((order) => {
            const meta: StatusMeta = STATUS_META[order.status] ??
              STATUS_META.sent ?? { label: order.status, tone: 'pending', step: 1 }
            const date = new Date(order.created_at).toLocaleString('ar-EG', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
            const isCancelled =
              order.status === 'rejected' ||
              order.status === 'cancelled' ||
              order.status === 'expired'

            return (
              <li key={order.id} className={styles.row}>
                <div className={styles.head}>
                  <span className={styles.code}>#{order.order_code}</span>
                  <span className={`${styles.status} ${styles[meta.tone]}`}>{meta.label}</span>
                </div>

                {order.business && (
                  <Link href={`/businesses/${order.business.slug}`} className={styles.biz}>
                    <StoreIcon size={12} />
                    <span>{order.business.name}</span>
                    {order.business.area && (
                      <>
                        <span className={styles.dot}>·</span>
                        <MapPinIcon size={11} />
                        <span>{order.business.area}</span>
                      </>
                    )}
                  </Link>
                )}

                {order.status === 'accepted' && order.expected_delivery_at && (
                  <div className={styles.etaBadge}>
                    <ClockIcon size={12} />
                    <span>
                      هيوصلك خلال{' '}
                      <strong>
                        {new Date(order.expected_delivery_at).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </strong>
                    </span>
                  </div>
                )}

                {!isCancelled && meta.step > 0 && (
                  <div className={styles.timeline}>
                    {STEPS.map((s) => {
                      const done = meta.step >= s.step
                      const active = meta.step === s.step
                      return (
                        <div
                          key={s.step}
                          className={`${styles.tlStep} ${done ? styles.tlDone : ''} ${active ? styles.tlActive : ''}`}
                        >
                          <span className={styles.tlDot} />
                          <span className={styles.tlLabel}>{s.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {isCancelled && (
                  <div className={styles.cancelledNote}>
                    {order.status === 'rejected'
                      ? 'النشاط معتذر عن الطلب — كلمه على واتساب لو محتاج'
                      : order.status === 'expired'
                        ? 'التاجر مردش في الوقت — جرّب تطلب من مكان تاني'
                        : 'الطلب اتلغى'}
                    {order.business && (
                      <Link href="/explore" className={styles.similarLink}>
                        شوف أنشطة مشابهة ←
                      </Link>
                    )}
                  </div>
                )}

                {order.status === 'delivered' &&
                  order.feedback_rating === null &&
                  order.business && (
                    <div className={styles.feedbackRow}>
                      <FeedbackForm orderId={order.id} businessName={order.business.name} />
                    </div>
                  )}

                {order.status === 'delivered' && order.feedback_rating !== null && (
                  <div className={styles.ratedNote}>
                    <span>قيّمت الطلب بـ</span>
                    <span className={styles.ratedStars}>
                      {'★'.repeat(order.feedback_rating)}
                      {'☆'.repeat(5 - order.feedback_rating)}
                    </span>
                  </div>
                )}

                <div className={styles.foot}>
                  <span className={styles.date}>
                    <ClockIcon size={11} /> {date}
                  </span>
                  {order.business && (
                    <Link href={`/businesses/${order.business.slug}`} className={styles.repeatBtn}>
                      اطلب تاني
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
