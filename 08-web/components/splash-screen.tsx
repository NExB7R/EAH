'use client'
import { useEffect, useState } from 'react'
import './splash-screen.css'

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setHiding(true), 900)
    const t2 = setTimeout(() => setVisible(false), 1250)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div className={`spl ${hiding ? 'is-hiding' : ''}`} aria-hidden>
      <div className="spl__logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/eah-word.webp" alt="EAH" className="spl__word" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/eah-crown.webp" alt="" className="spl__crown" />
      </div>
      <span className="spl__slogan">اللي نفسك فيه ؟</span>
    </div>
  )
}
