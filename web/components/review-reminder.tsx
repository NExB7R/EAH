'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StarIcon, CloseIcon } from './icons'
import { getDueReview, markReviewDone } from '@/lib/engagement'
import styles from './review-reminder.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Review Reminder
//   يظهر بعد ساعتين من كشف الرقم / طلب واتساب
//   يفتح صفحة النشاط على تبويب "اكتب تقييم"
// ═══════════════════════════════════════════════════════════

const CHECK_INTERVAL_MS = 60 * 1000

export default function ReviewReminder() {
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [businessSlug, setBusinessSlug] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => {
      const due = getDueReview()
      if (due) {
        setBusinessId(due.businessId)
        setBusinessSlug(due.businessSlug)
        setBusinessName(due.businessName)
      }
    }
    check()
    const timer = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  const dismiss = () => {
    if (businessId) markReviewDone(businessId)
    setBusinessId(null)
    setBusinessSlug(null)
    setBusinessName(null)
  }

  if (!mounted || !businessId || !businessSlug) return null

  return (
    <div className={styles.wrap} role="dialog" aria-modal="false">
      <div className={styles.card}>
        <button
          type="button"
          className={styles.close}
          onClick={dismiss}
          aria-label="إغلاق"
        >
          <CloseIcon size={14} />
        </button>

        <div className={styles.iconWrap}>
          <StarIcon size={20} />
        </div>

        <div className={styles.content}>
          <p className={styles.title}>قيّم تجربتك في {businessName}</p>
          <p className={styles.text}>
            رأيك يساعد غيرك ويعلي تقييم النشاط.
          </p>
        </div>

        <Link
          href={`/businesses/${businessSlug}?review=1`}
          className={styles.cta}
          onClick={dismiss}
        >
          اكتب تقييم
        </Link>
      </div>
    </div>
  )
}
