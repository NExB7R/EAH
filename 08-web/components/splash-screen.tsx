"use client"
import { useEffect, useState } from 'react'
import './splash-screen.css'

export default function SplashScreen() {
  const [gone, setGone] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('eah-splash-shown') === '1') {
      setGone(true)
      return
    }
    const t1 = setTimeout(() => setFading(true), 900)
    const t2 = setTimeout(() => {
      setGone(true)
      sessionStorage.setItem('eah-splash-shown', '1')
    }, 1300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (gone) return null

  return (
    <div className={`splash ${fading ? 'is-fading' : ''}`} aria-hidden>
      <div className="splash__inner">
        <img src="/eah-crown.webp" alt="" className="splash__crown" />
        <img src="/eah-word.webp" alt="EAH" className="splash__word" />
        <p className="splash__tagline">اللي نفسك فيه ؟</p>
      </div>
    </div>
  )
}
