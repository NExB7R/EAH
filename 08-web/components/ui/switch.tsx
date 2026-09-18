'use client'
import type { ChangeEvent } from 'react'

type Props = {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

export default function Switch({ checked, onChange, label, size = 'md', disabled }: Props) {
  return (
    <label className={`e-switch ${size === 'sm' ? 'e-switch--sm' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
      />
      <span className="e-switch__track"><span className="e-switch__thumb" /></span>
      {label && <span className="e-switch__label">{label}</span>}
    </label>
  )
}
