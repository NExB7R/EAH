'use client'
import { useEffect, useState } from 'react'
import EahLogo from './eah-logo'
import './splash-screen.css'

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setHiding(true), 1200)
    const t2 = setTimeout(() => setVisible(false), 1700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (!visible) return null

  return (
    <div className={`spl ${hiding ? 'is-hiding' : ''}`} aria-hidden>
      <div className="spl__bg" />
      <div className="spl__glow spl__glow--purple" />
      <div className="spl__glow spl__glow--gold" />

      <div className="spl__center">
        <div className="spl__logo-wrap">
          <div className="spl__logo">
            <EahLogo size="xl" variant="full" />
          </div>
          <div className="spl__ring" />
          <div className="spl__ring spl__ring--slow" />
        </div>
      </div>

      <div className="spl__bar">
        <span className="spl__bar-fill" />
      </div>
    </div>
  )
}
