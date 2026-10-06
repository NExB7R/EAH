'use client'

import { useMemo, useState } from 'react'
import { FileTextIcon } from '@/components/icons'
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
}

type Props = {
  orders: Order[]
}

const FILTERS = [
  { key: 'active', label: 'النشطة' },
  { key: 'sent', label: 'جديد' },
  { key: 'delivered', label: 'اتسلّم' },
  { key: 'all', label: 'الكل' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

const ACTIVE_STATUSES = ['sent', 'seen', 'accepted', 'preparing', 'on_way']

export default function OrderList({ orders }: Props) {
  const [filter, setFilter] = useState<FilterKey>('active')

  const filtered = useMemo(() => {
    if (filter === 'all') return orders
    if (filter === 'active') return orders.filter((o) => ACTIVE_STATUSES.includes(o.status))
    return orders.filter((o) => o.status === filter)
  }, [orders, filter])

  if (orders.length === 0) {
    return (
      <div className={styles.empty}>
        <FileTextIcon size={32} />
        <p>مفيش طلبات لسه</p>
        <small>كل طلب جديد هيظهر هنا فوراً</small>
      </div>
    )
  }

  return (
    <>
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
              {f.label} <span className={styles.filterCount}>{count}</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>مفيش طلبات في الفئة دي</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      )}
    </>
  )
}
