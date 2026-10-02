'use client'

import { useState, useTransition } from 'react'
import { CheckCircleIcon, AlertIcon, CloseIcon, GiftIcon } from '@/components/icons'
import { deleteOffer, toggleOfferPublish } from './actions'
import type { MerchantOffer } from '@/lib/data/merchant'
import styles from './offers.module.css'

type Props = {
  offers: MerchantOffer[]
}

export default function OfferList({ offers }: Props) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  const handleToggle = (id: string, isPublished: boolean) => {
    startTransition(async () => {
      const res = await toggleOfferPublish(id, isPublished)
      setMsg(res.ok ? (isPublished ? 'تم الإيقاف' : 'تم النشر') : res.error)
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('متأكد من الحذف؟')) return
    startTransition(async () => {
      const res = await deleteOffer(id)
      setMsg(res.ok ? 'تم الحذف' : res.error)
    })
  }

  return (
    <>
      {msg && <p className={styles.msg}>{msg}</p>}
      <div className={styles.list}>
        {offers.map((o) => {
          const ends = o.ends_at ? new Date(o.ends_at).toLocaleDateString('ar-EG') : '—'
          const isExpired = o.ends_at && new Date(o.ends_at) < new Date()
          return (
            <article
              key={o.id}
              className={`${styles.card} ${o.is_published ? '' : styles.cardDraft} ${isExpired ? styles.cardExpired : ''}`}
            >
              <div className={styles.cardBody}>
                <div className={styles.cardHead}>
                  <span
                    className={`${styles.statusDot} ${o.is_published && !isExpired ? styles.dotOn : styles.dotOff}`}
                  />
                  <h4 className={styles.cardTitle}>{o.title}</h4>
                </div>
                {o.description && <p className={styles.cardDesc}>{o.description}</p>}
                <div className={styles.cardMeta}>
                  <span>
                    <GiftIcon size={11} /> ينتهي: {ends}
                  </span>
                  {o.price != null && <span>· {o.price} ج.م</span>}
                </div>
              </div>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  onClick={() => handleToggle(o.id, o.is_published)}
                  disabled={pending}
                  className={`${styles.miniBtn} ${o.is_published ? styles.btnWarn : styles.btnOk}`}
                >
                  {o.is_published ? <AlertIcon size={12} /> : <CheckCircleIcon size={12} />}
                  <span>{o.is_published ? 'إيقاف' : 'نشر'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(o.id)}
                  disabled={pending}
                  className={`${styles.miniBtn} ${styles.btnDanger}`}
                >
                  <CloseIcon size={12} />
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
