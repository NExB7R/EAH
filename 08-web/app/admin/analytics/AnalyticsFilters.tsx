'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

const RANGES = [
  { key: '7', label: '7 أيام' },
  { key: '14', label: '14 يوم' },
  { key: '30', label: 'شهر' },
  { key: '90', label: '3 شهور' },
]

export default function AnalyticsFilters({ current }: { current: number }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [pending, start] = useTransition()

  function pick(days: string) {
    const params = new URLSearchParams(sp.toString())
    params.set('range', days)
    start(() => router.push(`/admin/analytics?${params.toString()}`))
  }

  return (
    <div className="ana-filters">
      {RANGES.map((r) => (
        <button
          key={r.key}
          type="button"
          className={`ana-filter ${current === parseInt(r.key, 10) ? 'is-active' : ''}`}
          onClick={() => pick(r.key)}
          disabled={pending}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
