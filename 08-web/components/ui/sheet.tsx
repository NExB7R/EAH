'use client'
import { useEffect, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function Sheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="e-sheet" onClick={onClose} role="dialog" aria-modal="true">
      <div className="e-sheet__panel" onClick={(e) => e.stopPropagation()}>
        <div className="e-sheet__handle" />
        {title && (
          <div className="e-sheet__head">
            <h3 className="e-sheet__title">{title}</h3>
            <button type="button" className="e-modal__close" onClick={onClose} aria-label="إغلاق">×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
