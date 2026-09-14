'use client'

export default function SplashScreen() {
  return (
    <div className="splash">
      <div className="splash__glow" aria-hidden />
      <div className="splash__logo-wrap">
        <div className="splash__crown-wrap">
          <span className="splash__pulse-ring" aria-hidden />
          <span className="splash__pulse-ring splash__pulse-ring--delay" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eah-crown.webp" alt="" className="splash__crown" aria-hidden />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/eah-word.webp" alt="EAH" className="splash__word" />
      </div>
    </div>
  )
}
