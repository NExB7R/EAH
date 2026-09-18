'use client'
import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  value: string | null  // ISO date YYYY-MM-DD
  onChange: (iso: string) => void
  placeholder?: string
  maxDate?: Date
  minDate?: Date
}

const DOW = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']
const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function DatePicker({ value, onChange, placeholder = 'اختار تاريخ', minDate, maxDate }: Props) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState<Date>(value ? new Date(value) : new Date())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const days = useMemo(() => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth()
    const first = new Date(y, m, 1)
    const startDow = first.getDay()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const arr: (Date | null)[] = Array(startDow).fill(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(y, m, d))
    return arr
  }, [viewDate])

  const today = toISO(new Date())

  const display = value
    ? `${new Date(value).getDate()} ${MONTHS[new Date(value).getMonth()]} ${new Date(value).getFullYear()}`
    : placeholder

  return (
    <div className="e-datepicker" ref={ref}>
      <button type="button" className="e-datepicker__trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className={value ? '' : 'e-datepicker__placeholder'}>{display}</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {open && (
        <div className="e-datepicker__pop">
          <div className="e-datepicker__nav">
            <button type="button" className="e-datepicker__navbtn"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              aria-label="الشهر السابق">‹</button>
            <span className="e-datepicker__month">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button type="button" className="e-datepicker__navbtn"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              aria-label="الشهر الجاي">›</button>
          </div>

          <div className="e-datepicker__grid">
            {DOW.map((d, i) => <div key={i} className="e-datepicker__dow">{d}</div>)}
            {days.map((d, i) => {
              if (!d) return <span key={i} />
              const iso = toISO(d)
              const disabled = (minDate && d < minDate) || (maxDate && d > maxDate)
              return (
                <button
                  key={i}
                  type="button"
                  className={`e-datepicker__day ${iso === today ? 'is-today' : ''} ${iso === value ? 'is-active' : ''}`}
                  disabled={!!disabled}
                  onClick={() => { onChange(iso); setOpen(false) }}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
