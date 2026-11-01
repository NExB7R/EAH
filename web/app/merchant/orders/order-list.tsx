'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileTextIcon, SearchIcon, CloseIcon } from '@/components/icons'
import OrderRow from './order-row'
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

type Props = {
  orders: Order[]
  isEnabled: boolean
}

const FILTERS = [
  { key: 'active', label: 'النشطة' },
  { key: 'sent', label: 'جديد' },
  { key: 'delivered', label: 'اتسلّم' },
  { key: 'all', label: 'الكل' },
] as const

const DATE_RANGES = [
  { key: 'today', label: 'اليوم' },
  { key: 'week', label: 'أسبوع' },
  { key: 'month', label: 'شهر' },
  { key: 'all', label: 'كل الوقت' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']
type DateKey = (typeof DATE_RANGES)[number]['key']

const ACTIVE_STATUSES = ['sent', 'seen', 'accepted', 'preparing', 'on_way']
const REFRESH_INTERVAL_MS = 30_000

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export default function OrderList({ orders, isEnabled }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('order')

  const [filter, setFilter] = useState<FilterKey>('active')
  const [dateRange, setDateRange] = useState<DateKey>('all')
  const [q, setQ] = useState('')
  const [now] = useState(() => Date.now())

  // Auto-refresh every 30s while tab is visible
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null
    const tick = () => {
      if (document.visibilityState === 'visible') {
        router.refresh()
      }
    }
    timer = setInterval(tick, REFRESH_INTERVAL_MS)
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [router])

  const filtered = useMemo(() => {
    let result = orders
    if (filter !== 'all') {
      if (filter === 'active') result = result.filter((o) => ACTIVE_STATUSES.includes(o.status))
      else result = result.filter((o) => o.status === filter)
    }
    if (dateRange !== 'all') {
      let cutoff = 0
      if (dateRange === 'today') cutoff = startOfDay(now)
      else if (dateRange === 'week') cutoff = now - 7 * 24 * 60 * 60 * 1000
      else if (dateRange === 'month') cutoff = now - 30 * 24 * 60 * 60 * 1000
      result = result.filter((o) => new Date(o.created_at).getTime() >= cutoff)
    }
    const query = q.trim().toLowerCase()
    if (query) {
      result = result.filter(
        (o) =>
          o.order_code.toLowerCase().includes(query) ||
          (o.customer_name ?? '').toLowerCase().includes(query) ||
          (o.customer_phone ?? '').includes(query),
      )
    }
    return result
  }, [orders, filter, dateRange, q, now])

  if (orders.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <FileTextIcon size={36} />
        </span>
        <p className={styles.emptyTitle}>مفيش طلبات لسه</p>
        <small className={styles.emptySub}>
          {isEnabled ? 'كل طلب جديد هيظهر هنا فوراً' : 'فعّل استلام الطلبات عشان تبدأ تستقبل'}
        </small>
      </div>
    )
  }

  return (
    <>
      <div className={styles.searchWrap}>
        <SearchIcon size={18} className={styles.searchIcon} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث برقم الطلب / اسم / موبايل..."
          className={styles.searchInput}
          dir="rtl"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            className={styles.searchClear}
            aria-label="مسح البحث"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      <div className={styles.stickyBar}>
        <div className={styles.filters}>
          {FILTERS.map((f) => {
            const count =
              f.key === 'all'
                ? orders.length
                : f.key === 'active'
                  ? orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length
                  : orders.filter((o) => o.status === f.key).length
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
              >
                <span>{f.label}</span>
                <span className={styles.filterCount}>{count}</span>
              </button>
            )
          })}
        </div>

        <div className={styles.dateTabs}>
          {DATE_RANGES.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDateRange(d.key)}
              className={`${styles.dateTab} ${dateRange === d.key ? styles.dateTabActive : ''}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.resultCount}>{filtered.length.toLocaleString('ar-EG')} نتيجة</div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>مفيش طلبات في الفئة دي</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((o) => (
            <OrderRow key={o.id} order={o} isHighlighted={highlightId === o.id} />
          ))}
        </div>
      )}
    </>
  )
}
