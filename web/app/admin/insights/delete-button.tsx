'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteInsight } from './actions'
import styles from './delete-button.module.css'

type Props = {
  insightId: string
  businessName: string
}

export default function DeleteButton({ insightId, businessName }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  const click = () => {
    if (!confirm(`حذف تقرير "${businessName}"؟ لا يمكن التراجع.`)) return
    setErr(null)
    startTransition(async () => {
      const res = await deleteInsight(insightId)
      if (res.ok) router.refresh()
      else setErr(res.error ?? 'فشل')
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={click}
        disabled={pending}
        className={styles.btn}
        title={err ?? 'حذف التقرير'}
      >
        {pending ? '…' : 'حذف'}
      </button>
    </>
  )
}
