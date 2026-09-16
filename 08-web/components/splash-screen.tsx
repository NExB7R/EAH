'use client'
import { useEffect, useState } from 'react'
import './splash-screen.css'

export default function SplashScreen() {
  const [hide, setHide] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    // اخفي السبليش بعد ما الصفحة تجهز أو بعد 900ms
    const t1 = setTimeout(() => setHide(true), 900)
    const t2 = setTimeout(() => setGone(true), 1500)

    const onLoad = () => {
      setHide(true)
      setTimeout(() => setGone(true), 500)
    }
    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad, { once: true })

    return () => {
      clearTimeout(t1); clearTimeout(t2)
      window.removeEventListener('load', onLoad)
    }
  }, [])

  if (gone) return null

  return (
    <div className={`splash ${hide ? 'splash--hide' : ''}`} aria-hidden>
      <div className="splash__bg" />
      <div className="splash__ring" />
      <div className="splash__ring splash__ring--2" />
      <div className="splash__logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/eah-crown.webp" alt="" className="splash__crown" />
        <div className="splash__glow" />
      </div>
      <div className="splash__bar">
        <span className="splash__bar-fill" />
      </div>
    </div>
  )
}
