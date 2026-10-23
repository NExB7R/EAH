'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SparklesIcon } from '@/components/icons'
import { generateInsight } from './actions'
import styles from './request-button.module.css'

export default function RequestReportButton({ businessId }: { businessId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const click = () => {
    if (!businessId) {
      setError('النشاط مش محدد')
      return
    }
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      try {
        const res = await generateInsight(businessId, 30)
        if (res.ok) {
          setSuccess(true)
          router.refresh()
          setTimeout(() => setSuccess(false), 3000)
        } else {
          setError(res.error ?? 'فشل التوليد')
        }
      } catch {
        setError('حدث خطأ غير متوقع')
      }
    })
  }

  return (
    <div className={styles.wrap}>
      <button type="button" onClick={click} disabled={pending} className={styles.btn}>
        <SparklesIcon size={14} />
        <span>{pending ? 'بيتولّد…' : 'اطلب تقرير جديد'}</span>
      </button>
      {error && <span className={styles.err}>{error}</span>}
      {success && <span className={styles.ok}>تم ✓</span>}
    </div>
  )
}
