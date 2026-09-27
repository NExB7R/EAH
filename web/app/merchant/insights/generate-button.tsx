'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SparklesIcon } from '@/components/icons'
import { generateInsight } from './actions'
import styles from './generate-button.module.css'

type Props = {
  businessId: string
}

export default function GenerateButton({ businessId }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    setError(null)
    startTransition(async () => {
      const result = await generateInsight(businessId, 30)
      if (result.ok) {
        router.push(`/merchant/insights/${result.insightId}`)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={styles.btn}
      >
        <SparklesIcon size={16} />
        <span>{pending ? 'بيتم التحليل...' : 'استخرج تقرير جديد'}</span>
      </button>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
