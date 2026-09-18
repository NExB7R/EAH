'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'end'
  up?: boolean
}

export default function Popover({ trigger, children, align = 'start', up = false }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="e-popover" ref={ref}>
      <span onClick={() => setOpen((v) => !v)}>{trigger}</span>
      {open && (
        <div
          className={`e-popover__panel ${align === 'end' ? 'e-popover__panel--end' : ''} ${up ? 'e-popover__panel--up' : ''}`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}
