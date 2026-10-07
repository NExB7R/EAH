'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { GiftIcon, AlertIcon } from '@/components/icons'
import { startFreeTrial } from './actions'
import styles from './subscription.module.css'

// زر بدء التجربة المجانية — مرة واحدة لكل نشاط
export default function StartTrialButton({ businessName }: { businessName: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handle = () => {
    if (
      !confirm(
        `تبدأ تجربة مجانية 30 يوم على الباقة المميزة للنشاط "${businessName}"؟\n\nملاحظة: التجربة مرة واحدة فقط لكل نشاط.`,
      )
    ) {
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await startFreeTrial()
      if (res.ok) {
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div className={styles.trialCta}>
      <div className={styles.trialCtaBody}>
        <span className={styles.trialCtaIcon}>
          <GiftIcon size={22} />
        </span>
        <div>
          <strong className={styles.trialCtaTitle}>جرّب الباقة المميزة 30 يوم مجاناً</strong>
          <p className={styles.trialCtaDesc}>
            ظهور في الرئيسية + شارة مميز + إحصائيات كاملة + 3 عروض شهرياً — بدون دفع
          </p>
        </div>
      </div>
      <button type="button" onClick={handle} disabled={pending} className={styles.trialCtaBtn}>
        {pending ? '...' : 'ابدأ التجربة المجانية'}
      </button>
      {error && (
        <div className={styles.requestErr}>
          <AlertIcon size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
