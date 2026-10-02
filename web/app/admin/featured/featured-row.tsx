'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { PinIcon, ExternalLinkIcon, CheckCircleIcon, CloseIcon } from '@/components/icons'
import { toggleFeatured, togglePin, setFeaturedOrder, extendFeaturedUntil } from './actions'
import styles from './featured.module.css'

type Props = {
  business: {
    id: string
    name: string
    slug: string
    business_type: string
    area: string | null
    cover_image_url: string | null
    featured_pin: boolean
    featured_order: number
    featured_until: string | null
  }
}

export default function FeaturedRow({ business }: Props) {
  const [pending, startTransition] = useTransition()
  const [order, setOrder] = useState(business.featured_order)
  const [msg, setMsg] = useState<string | null>(null)

  const handleToggle = () => {
    if (!confirm(`إلغاء تمييز "${business.name}"؟`)) return
    startTransition(async () => {
      const res = await toggleFeatured(business.id, true)
      setMsg(res.ok ? 'تم الإلغاء' : res.error)
    })
  }

  const handlePin = () => {
    startTransition(async () => {
      const res = await togglePin(business.id, business.featured_pin)
      setMsg(res.ok ? 'تم' : res.error)
    })
  }

  const handleOrder = (n: number) => {
    setOrder(n)
    startTransition(async () => {
      const res = await setFeaturedOrder(business.id, n)
      if (!res.ok) setMsg(res.error)
    })
  }

  const handleExtend = (days: number) => {
    startTransition(async () => {
      const res = await extendFeaturedUntil(business.id, days)
      setMsg(res.ok ? `+${days} يوم` : res.error)
    })
  }

  const until = business.featured_until
    ? new Date(business.featured_until).toLocaleDateString('ar-EG')
    : 'بدون تاريخ'

  return (
    <div className={`${styles.row} ${business.featured_pin ? styles.pinned : ''}`}>
      <div className={styles.info}>
        <div className={styles.nameWrap}>
          {business.featured_pin && (
            <span className={styles.pinBadge}>
              <PinIcon size={11} />
              مثبّت
            </span>
          )}
          <h3 className={styles.name}>{business.name}</h3>
        </div>
        <p className={styles.meta}>
          {business.area ?? '—'} · ينتهي: {until}
        </p>
        <div className={styles.orderWrap}>
          <span className={styles.orderLabel}>ترتيب:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleOrder(n)}
              disabled={pending}
              className={`${styles.orderBtn} ${n === order ? styles.orderActive : ''}`}
              aria-label={`ترتيب ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={handlePin}
          disabled={pending}
          className={`${styles.btn} ${business.featured_pin ? styles.btnActive : ''}`}
          title={business.featured_pin ? 'إلغاء التثبيت' : 'تثبيت'}
        >
          <PinIcon size={14} />
        </button>

        <button
          type="button"
          onClick={() => handleExtend(30)}
          disabled={pending}
          className={styles.btn}
          title="+30 يوم"
        >
          +30
        </button>

        <button
          type="button"
          onClick={() => handleExtend(90)}
          disabled={pending}
          className={styles.btn}
          title="+90 يوم"
        >
          +90
        </button>

        <Link
          href={`/businesses/${business.slug}`}
          target="_blank"
          className={styles.btn}
          title="فتح الصفحة"
        >
          <ExternalLinkIcon size={14} />
        </Link>

        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          className={`${styles.btn} ${styles.btnDanger}`}
          title="إلغاء التمييز"
        >
          <CloseIcon size={14} />
        </button>
      </div>

      {msg && (
        <div className={styles.msg}>
          <CheckCircleIcon size={12} />
          {msg}
        </div>
      )}
    </div>
  )
}
