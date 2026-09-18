'use client'
import type { CSSProperties } from 'react'

type Props = {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
  label?: string
  suffix?: string
}

export default function Slider({ value, min = 0, max = 100, step = 1, onChange, label, suffix }: Props) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="e-slider">
      {(label || suffix) && (
        <div className="e-slider__head">
          {label && <span>{label}</span>}
          <span className="e-slider__value">{value}{suffix ?? ''}</span>
        </div>
      )}
      <input
        type="range"
        className="e-slider__input"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--pct': `${pct}%` } as CSSProperties}
      />
    </div>
  )
}
