"use client"
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import FoodFilterBar from './food-filter-bar'

export default function SearchFilters({ initialFood }: { initialFood?: string | null }) {
  const [food, setFood] = useState<string | null>(initialFood ?? null)
  const [pending, start] = useTransition()
  const router = useRouter()

  function update(next: string | null) {
    setFood(next)
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    if (next) params.set('food', next)
    else params.delete('food')
    start(() => router.push(`/search?${params.toString()}`))
  }

  return (
    <div style={{ opacity: pending ? 0.6 : 1, transition: 'opacity .2s' }}>
      <FoodFilterBar value={food} onChange={update} />
    </div>
  )
}
