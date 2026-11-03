'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ExternalLinkIcon, CheckCircleIcon, CloseIcon, ClockIcon } from '@/components/icons'
import { toggleFeatured, extendFeaturedUntil } from './actions'
import styles from './featured.module.css'

type Props = {
  business: {
    id: string
    name: string
    slug: string
    area: string | null
    featured_until: string | null
    is_published: boolean
    paid_featured_home_eligible: boolean
  }
}

export default function FeaturedRow({ business }: Props) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const untilMs = business.featured_until ? new Date(business.featured_until).getTime() : 0
  const expired = !!business.featured_until && (!Number.isFinite(untilMs) || untilMs <= Date.now())
  const until = business.featured_until
    ? new Date(business.featured_until).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'بدون انتهاء'

  const handleToggle = () => {
    if (!confirm(`إيقاف ظهور "${business.name}" في المميزون؟`)) return
    startTransition(async () => {
      const result = await toggleFeatured(business.id, true)
      setMsg(result.ok ? 'تم إيقاف الميزة' : result.error)
    })
  }

  const handleExtend = (days: number) => {
    startTransition(async () => {
      const result = await extendFeaturedUntil(business.id, days)
      setMsg(result.ok ? `تم تجديد الميزة لمدة ${days} يومًا` : result.error)
    })
  }

  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <div className={styles.nameWrap}>
          <h3 className={styles.name}>{business.name}</h3>
          {!business.is_published && <span className={styles.meta}>غير منشور</span>}
          {expired && <span className={styles.meta}>انتهت مدة التمييز — متوقف عن الظهور</span>}
          {!business.paid_featured_home_eligible && <span className={styles.meta}>لا يوجد اشتراك مدفوع ساري يمنح ظهور الرئيسية</span>}
        </div>
        <p className={styles.meta}>
          {business.area ?? '—'} · {expired ? 'انتهى التمييز' : `ينتهي: ${until}`}
        </p>
      </div>

      <div className={styles.actions}>
        {business.paid_featured_home_eligible && expired && (
          <button type="button" onClick={() => handleExtend(30)} disabled={pending} className={styles.btn}>
            <ClockIcon size={13} /> تجديد 30 يوم
          </button>
        )}
        {business.paid_featured_home_eligible && !expired && (
          <button type="button" onClick={() => handleExtend(90)} disabled={pending} className={styles.btn}>
            +90 يوم
          </button>
        )}
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
