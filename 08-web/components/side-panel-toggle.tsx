'use client'
import { useEffect, useState } from 'react'
import './side-panel-toggle.css'

export default function SidePanelToggle() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  const toggle = () => {
    window.dispatchEvent(new CustomEvent('eah:toggle-sidepanel'))
  }

  if (!visible) return null

  return (
    <button
      type="button"
      className="spt"
      onClick={toggle}
      aria-label="الأكثر رواجاً"
      title="الأكثر رواجاً"
    >
      <span className="spt__icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21.5 L12 17 L6 21.5 L8 14 L2 9.5 L9.5 9 Z" />
        </svg>
      </span>
      <span className="spt__pulse" aria-hidden />
    </button>
  )
}
