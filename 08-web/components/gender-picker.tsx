'use client'
import { useState } from 'react'
import { IcUser } from './eah-icons'

export default function GenderPicker({ initial }: { initial: 'male' | 'female' | null }) {
  const [value, setValue] = useState<'male' | 'female' | null>(initial)

  return (
    <div className="edit__gender">
      <label className={`edit__gender-btn ${value === 'male' ? 'is-active' : ''}`}>
        <input
          type="radio"
          name="gender"
          value="male"
          checked={value === 'male'}
          onChange={() => setValue('male')}
        />
        <span><IcUser /> ذكر</span>
      </label>
      <label className={`edit__gender-btn ${value === 'female' ? 'is-active' : ''}`}>
        <input
          type="radio"
          name="gender"
          value="female"
          checked={value === 'female'}
          onChange={() => setValue('female')}
        />
        <span><IcUser /> أنثى</span>
      </label>
    </div>
  )
}
