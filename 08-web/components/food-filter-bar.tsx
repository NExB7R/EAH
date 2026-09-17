"use client"
import { FOOD_CATEGORIES } from '@/lib/food/categories'
import './food-filter-bar.css'

export default function FoodFilterBar({
  value,
  onChange,
}: {
  value: string | null
  onChange: (v: string | null) => void
}) {
  return (
    <div className="ffb" aria-label="فلتر تصنيفات الأكل">
      <button
        type="button"
        className={`ffb__chip ${!value ? 'is-on' : ''}`}
        onClick={() => onChange(null)}
      >
        ✨ الكل
      </button>
      {FOOD_CATEGORIES.map((c) => (
        <button
          key={c.key}
          type="button"
          className={`ffb__chip ${value === c.key ? 'is-on' : ''}`}
          onClick={() => onChange(value === c.key ? null : c.key)}
        >
          {c.emoji} {c.label}
        </button>
      ))}
    </div>
  )
}
