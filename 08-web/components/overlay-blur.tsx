'use client'
import './overlay-blur.css'

export default function OverlayBlur({ open }: { open: boolean }) {
  return <div className={`overlay-blur ${open ? 'is-open' : ''}`} aria-hidden />
}
