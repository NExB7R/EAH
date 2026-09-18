'use client'
import { useEffect, useMemo, useRef, useState } from 'react'

type Option = { value: string; label: string }

type Props = {
  options: Option[]
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
  searchable?: boolean
}

export default function Combobox({ options, value, onChange, placeholder = 'اختار', searchable = true }: Props) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const filtered = useMemo(() => {
    if (!q.trim()) return options
    const s = q.trim().toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(s))
  }, [options, q])

  const current = options.find((o) => o.value === value)

  return (
    <div className="e-combo" ref={ref}>
      <button
        type="button"
        className="e-combo__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={current ? '' : 'e-combo__placeholder'}>
          {current ? current.label : placeholder}
        </span>
        <svg className="e-combo__caret" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="e-combo__menu">
          {searchable && (
            <input
              type="text"
              className="e-combo__search"
              placeholder="دور..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          )}
          {filtered.length === 0 ? (
            <div className="e-combo__empty">مفيش نتائج</div>
          ) : (
            filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`e-combo__opt ${value === o.value ? 'is-active' : ''}`}
                onClick={() => { onChange(o.value); setOpen(false); setQ('') }}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
