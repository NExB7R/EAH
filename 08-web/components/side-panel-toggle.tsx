'use client'
import { useEffect, useState } from 'react'
import './side-panel-toggle.css'

export default function SidePanelToggle() {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setVisible(true)
    const sync = () => {
      setOpen(localStorage.getItem('eah-sidepanel-open') === '1')
    }
    sync()
    window.addEventListener('eah:toggle-sidepanel', sync)
    window.addEventListener('eah:open-sidepanel', sync)
    return () => {
      window.removeEventListener('eah:toggle-sidepanel', sync)
      window.removeEventListener('eah:open-sidepanel', sync)
    }
  }, [])

  const toggle = () => {
    window.dispatchEvent(new CustomEvent('eah:toggle-sidepanel'))
  }

  if (!visible) return null

  return (
    <button
      type="button"
      className={`spt ${open ? 'is-open' : ''}`}
      onClick={toggle}
      aria-label="اكتشف الترند والمميز"
      aria-pressed={open}
    >
      <span className="spt__icon" aria-hidden>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Trending icon — flame + arrow, not a star */}
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      </span>
      <span className="spt__label">اكتشف</span>
      <span className="spt__chevron" aria-hidden>
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
    </button>
  )
}
