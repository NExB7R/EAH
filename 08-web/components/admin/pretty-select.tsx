'use client'
import { useState, useRef, useEffect } from 'react'
import './pretty-select.css'

type Option = { value: string; label: string; emoji?: string }

type Props = {
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (v: string) => void
  options: Option[]
  placeholder?: string
  id?: string
}

export default function PrettySelect({
  name,
  value: controlled,
  defaultValue,
  onChange,
  options,
  placeholder = 'اختار...',
  id,
}: Props) {
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value ?? '')
  const value = controlled ?? internal
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  const handleSelect = (v: string) => {
    if (controlled === undefined) setInternal(v)
    onChange?.(v)
    setOpen(false)
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="psel" ref={ref}>
      {name && <input type="hidden" name={name} value={value} />}

      <button
        type="button"
        id={id}
        className={`psel__trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="psel__value">
          {selected?.emoji && <span className="psel__emoji">{selected.emoji}</span>}
          {selected?.label ?? placeholder}
        </span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="psel__arrow">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="psel__menu" role="listbox">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`psel__option ${o.value === value ? 'is-selected' : ''}`}
              onClick={() => handleSelect(o.value)}
              role="option"
              aria-selected={o.value === value}
            >
              {o.emoji && <span className="psel__emoji">{o.emoji}</span>}
              <span>{o.label}</span>
              {o.value === value && (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="psel__check">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
