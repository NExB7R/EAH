'use client'

import { useMemo, useState } from 'react'
import { SearchIcon, CloseIcon, FileTextIcon } from '@/components/icons'
import AdminOrderCard from './order-card'
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

const FILTERS = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'معلقة' },
  { key: 'in_progress', label: 'نشطة' },
  { key: 'delivered', label: 'اتسلّمت' },
  { key: 'cancelled', label: 'ملغية' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

const PENDING = ['sent', 'seen']
const IN_PROGRESS = ['accepted', 'preparing', 'on_way']
const CANCELLED = ['rejected', 'cancelled', 'expired']

export default function AdminOrdersList({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [q, setQ] = useState('')

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => PENDING.includes(o.status)).length,
      in_progress: orders.filter((o) => IN_PROGRESS.includes(o.status)).length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => CANCELLED.includes(o.status)).length,
    }
  }, [orders])

  const filtered = useMemo(() => {
    let result = orders
    if (filter === 'pending') result = result.filter((o) => PENDING.includes(o.status))
    else if (filter === 'in_progress') result = result.filter((o) => IN_PROGRESS.includes(o.status))
    else if (filter === 'delivered') result = result.filter((o) => o.status === 'delivered')
    else if (filter === 'cancelled') result = result.filter((o) => CANCELLED.includes(o.status))

    const query = q.trim().toLowerCase()
    if (query) {
      result = result.filter(
        (o) =>
          o.order_code.toLowerCase().includes(query) ||
          (o.customer_name ?? '').toLowerCase().includes(query) ||
          (o.business_name ?? '').toLowerCase().includes(query) ||
          (o.customer_phone ?? '').includes(query),
      )
    }
    return result
  }, [orders, filter, q])

  if (orders.length === 0) {
    return (
      <div className={styles.empty}>
        <FileTextIcon size={36} />
        <p className={styles.emptyTitle}>مفيش طلبات لسه</p>
        <small className={styles.emptySub}>كل طلب جديد من أي نشاط هيظهر هنا فوراً</small>
      </div>
    )
  }

  return (
    <>
      <div className={styles.searchWrap}>
        <SearchIcon size={16} className={styles.searchIcon} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث برقم الطلب / اسم / رقم / نشاط..."
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

      <div className={styles.resultCount}>{filtered.length.toLocaleString('en-US')} نتيجة</div>

      <div className={styles.list}>
        {filtered.map((o) => (
          <AdminOrderCard key={o.id} order={o} />
        ))}
      </div>
    </>
  )
}
