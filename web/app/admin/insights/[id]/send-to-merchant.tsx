'use client'

import { useState, useTransition } from 'react'
import { CheckCircleIcon, AlertIcon, BellIcon } from '@/components/icons'
import { sendInsightToMerchant } from './actions'
import styles from './send-to-merchant.module.css'

type Props = { insightId: string }

export default function SendToMerchant({ insightId }: Props) {
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle')
  const [error, setError] = useState<string | null>(null)

  const send = () => {
    if (pending) return
    setState('idle')
    setError(null)
    startTransition(async () => {
      const res = await sendInsightToMerchant(insightId)
      if (res.ok) {
        setState('ok')
        setTimeout(() => setState('idle'), 3000)
      } else {
        setState('err')
        setError(res.error)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={send}
      disabled={pending || state === 'ok'}
      className={styles.btn}
      title={error ?? 'إرسال إشعار لالتاجر المرتبط بالنشاط'}
    >
      {state === 'ok' ? (
        <>
          <CheckCircleIcon size={13} />
          <span>اترسل</span>
        </>
      ) : state === 'err' ? (
        <>
          <AlertIcon size={13} />
          <span>فشل</span>
        </>
      ) : (
        <>
          <BellIcon size={13} />
          <span>{pending ? '…' : 'إرسال لالتاجر المرتبط بالنشاط'}</span>
        </>
      )}
    </button>
  )
}
