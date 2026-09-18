'use client'
import { useEffect, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  actions?: ReactNode
}

export default function Modal({ open, onClose, title, children, actions }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="e-modal" onClick={onClose} role="dialog" aria-modal="true">
      <div className="e-modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="e-modal__head">
          {title && <h3 className="e-modal__title">{title}</h3>}
          <button type="button" className="e-modal__close" onClick={onClose} aria-label="إغلاق">×</button>
        </div>
        <div className="e-modal__body">{children}</div>
        {actions && <div className="e-modal__actions">{actions}</div>}
      </div>
    </div>
  )
}
