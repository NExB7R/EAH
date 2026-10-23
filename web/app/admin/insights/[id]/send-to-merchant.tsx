'use client'

import { useState, useTransition } from 'react'
import { CheckCircleIcon, AlertIcon, BellIcon } from '@/components/icons'
import { sendInsightToMerchant } from './actions'

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
      className="sendToMerchantBtn"
      title={error ?? 'إرسال إشعار لصاحب النشاط'}
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
          <span>{pending ? '…' : 'إرسال لصاحب النشاط'}</span>
        </>
      )}
    </button>
  )
}
