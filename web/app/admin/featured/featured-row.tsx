'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ExternalLinkIcon, CheckCircleIcon, CloseIcon } from '@/components/icons'
import { toggleFeatured } from './actions'
import styles from './featured.module.css'

type Props = {
  business: {
    id: string
    name: string
    slug: string
    area: string | null
    is_published: boolean
    paid_featured_home_eligible: boolean
    paid_featured_home_expires_at: string | null
  }
}

export default function FeaturedRow({ business }: Props) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const subscriptionExpiry = business.paid_featured_home_expires_at
    ? new Date(business.paid_featured_home_expires_at).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'بدون تاريخ انتهاء محدد'

  const handleToggle = () => {
    if (!confirm(`إيقاف ظهور "${business.name}" في المميزون؟`)) return
    startTransition(async () => {
      const result = await toggleFeatured(business.id, true)
      setMsg(result.ok ? 'تم إيقاف الميزة' : result.error)
    })
  }


  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <div className={styles.nameWrap}>
          <h3 className={styles.name}>{business.name}</h3>
          {!business.is_published && <span className={styles.meta}>غير منشور</span>}
          {!business.paid_featured_home_eligible && <span className={styles.meta}>محدد إداريًا — لا يوجد اشتراك ساري يمنح ظهور الرئيسية</span>}
        </div>
        <p className={styles.meta}>
          {business.area ?? '—'} · {business.paid_featured_home_eligible ? `اشتراك الرئيسية: ${subscriptionExpiry}` : 'لا يوجد استحقاق نشط لظهور الرئيسية'}
        </p>
      </div>

      <div className={styles.actions}>
        <Link href={`/businesses/${business.slug}`} target="_blank" className={styles.btn} title="فتح الصفحة">
          <ExternalLinkIcon size={14} />
        </Link>
        <button type="button" onClick={handleToggle} disabled={pending} className={`${styles.btn} ${styles.btnDanger}`} title="إيقاف الميزة">
          <CloseIcon size={14} /> إيقاف
        </button>
      </div>

      {msg && <div className={styles.msg}><CheckCircleIcon size={12} />{msg}</div>}
    </div>
  )
}
