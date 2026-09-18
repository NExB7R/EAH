'use client'
import { useState, type ReactNode } from 'react'

type Item = { key: string; title: string; content: ReactNode }

export default function Accordion({ items, allowMultiple = false }: { items: Item[]; allowMultiple?: boolean }) {
  const [open, setOpen] = useState<string[]>([])
  const toggle = (key: string) => {
    setOpen((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key)
      return allowMultiple ? [...prev, key] : [key]
    })
  }

  return (
    <div className="e-accordion">
      {items.map((it) => {
        const isOpen = open.includes(it.key)
        return (
          <div key={it.key} className={`e-acc-item ${isOpen ? 'is-open' : ''}`}>
            <button type="button" className="e-acc-trigger" onClick={() => toggle(it.key)} aria-expanded={isOpen}>
              <span>{it.title}</span>
              <span className="e-acc-icon">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>
            {isOpen && <div className="e-acc-panel">{it.content}</div>}
          </div>
        )
      })}
    </div>
  )
}
