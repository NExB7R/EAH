'use client'
import { useState } from 'react'
import { MISC_CATEGORIES } from '@/lib/misc-categories'

const PRESETS = [
  { value: 'restaurant', label: 'مطعم' },
  { value: 'pharmacy', label: 'صيدلية' },
  { value: 'supermarket', label: 'ماركت' },
  { value: 'delivery_office', label: 'مكتب توصيل' },
  { value: 'misc', label: 'أنشطة أخرى' },
]

export default function ApplyCategoryPicker() {
  const [selected, setSelected] = useState<string>('restaurant')
  const [customName, setCustomName] = useState('')
  const [subCategory, setSubCategory] = useState<string | null>(null)

  return (
    <div className="ap-field">
      <label className="ap-label">نوع النشاط *</label>

      <div className="ap-categories">
        {PRESETS.map((c) => (
          <label key={c.value} className={`ap-cat ${selected === c.value ? 'is-active' : ''}`}>
            <input
              type="radio"
              name="business_type"
              value={c.value}
              checked={selected === c.value}
              onChange={() => setSelected(c.value)}
            />
            <span className="ap-cat__label">{c.label}</span>
          </label>
        ))}
      </div>

      <input type="hidden" name="business_type" value={selected} />

      {selected === 'other' && (
        <input
          type="text"
          name="custom_name"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="اكتب نوع النشاط"
          className="ap-input"
        />
      )}
    </div>
  )
}
