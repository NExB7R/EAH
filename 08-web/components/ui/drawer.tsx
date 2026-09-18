'use client'
import { useEffect, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  side?: 'end' | 'start'
  children: ReactNode
}

export default function Drawer({ open, onClose, title, side = 'end', children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className={`e-drawer ${side === 'start' ? 'e-drawer--start' : ''}`} onClick={onClose} role="dialog" aria-modal="true">
      <div className="e-drawer__panel" onClick={(e) => e.stopPropagation()}>
        <div className="e-drawer__head">
          {title && <h3 className="e-drawer__title">{title}</h3>}
          <button type="button" className="e-drawer__close" onClick={onClose} aria-label="إغلاق">×</button>
        </div>
        <div className="e-drawer__body">{children}</div>
      </div>
    </div>
  )
}
