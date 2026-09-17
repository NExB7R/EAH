'use client'
import { useState } from 'react'
import { FOOD_CATEGORIES } from '@/lib/food/categories'
import './food-categories-picker.css'

export default function FoodCategoriesPicker({
  value, onChange, max = 5,
}: { value: string[]; onChange: (v: string[]) => void; max?: number }) {
  function toggle(key: string) {
    if (value.includes(key)) onChange(value.filter((k) => k !== key))
    else if (value.length < max) onChange([...value, key])
  }
  return (
    <div className="fcp">
      <div className="fcp__head">
        <span>🍽 التصنيفات ({value.length}/{max})</span>
        <small>اختار لحد {max} تصنيفات</small>
      </div>
      <div className="fcp__grid">
        {FOOD_CATEGORIES.map((c) => {
          const active = value.includes(c.key)
          return (
            <button key={c.key} type="button" onClick={() => toggle(c.key)} className={`fcp__chip ${active ? 'is-on' : ''}`}>
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
