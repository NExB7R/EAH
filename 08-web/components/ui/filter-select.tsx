'use client'
import { useEffect, useRef, useState } from 'react'
import './filter-select.css'

export type FilterOption = {
  value: string
  label: string
  emoji?: string
  count?: number
}

type Props = {
  label: string
  value: string | null
  options: FilterOption[]
  onChange: (value: string | null) => void
  placeholder?: string
  clearable?: boolean
  align?: 'start' | 'end'
}

export default function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'الكل',
  clearable = true,
  align = 'start',
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const selected = options.find((o) => o.value === value)
  const hasValue = !!value && !!selected

  return (
    <div className="fs" ref={ref}>
      <button
        type="button"
        className={`fs__trigger ${hasValue ? 'is-active' : ''} ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="fs__label">{label}</span>
        <span className="fs__value">
          {selected?.emoji && <span className="fs__emoji">{selected.emoji}</span>}
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className="fs__chevron"
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={`fs__menu fs__menu--${align}`} role="listbox">
          {clearable && (
            <button
              type="button"
              className={`fs__item ${!value ? 'is-selected' : ''}`}
              onClick={() => { onChange(null); setOpen(false) }}
            >
              <span className="fs__item-label">{placeholder}</span>
              {!value && <span className="fs__check">✓</span>}
            </button>
          )}
          {options.map((opt) => {
            const isSel = value === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                className={`fs__item ${isSel ? 'is-selected' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                role="option"
                aria-selected={isSel}
              >
                {opt.emoji && <span className="fs__item-emoji">{opt.emoji}</span>}
                <span className="fs__item-label">{opt.label}</span>
                {opt.count != null && <span className="fs__item-count">{opt.count}</span>}
                {isSel && <span className="fs__check">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
