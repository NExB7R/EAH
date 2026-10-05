'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, AlertIcon } from '@/components/icons'
import { requestSubscription } from './actions'
import styles from './subscription.module.css'

type Props = {
  planCode: string
  planName: string
  isFree: boolean
}

export default function SubscribeButton({ planCode, planName, isFree }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const router = useRouter()

  if (done) {
    return (
      <div className={styles.requestOk}>
        <CheckCircleIcon size={14} />
        <span>الطلب وصل — هيتم التواصل معاك</span>
      </div>
    )
  }

  const handle = () => {
    if (isFree) return
    if (!confirm(`تأكيد طلب "${planName}"؟`)) return
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('planCode', planCode)
      const res = await requestSubscription(fd)
      if (res.ok) {
        setDone(true)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <>
      <button type="button" onClick={handle} disabled={pending} className={styles.planCta}>
        {pending ? '...' : isFree ? 'ابدأ بالأساسية' : 'اشترك'}
      </button>
      {error && (
        <div className={styles.requestErr}>
          <AlertIcon size={12} />
          <span>{error}</span>
        </div>
      )}
    </>
  )
}
