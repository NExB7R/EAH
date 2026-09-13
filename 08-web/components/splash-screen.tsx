'use client'
export default function SplashScreen() {
  return (
    <div className="splash">
      <div className="splash__glow" aria-hidden />
      <div className="splash__logo-wrap">
        <img src="/eah-crown.webp" alt="" className="splash__crown" aria-hidden />
        <img src="/eah-word.webp" alt="EAH" className="splash__word" />
      </div>
      <div className="splash__loading" aria-hidden>
        <span /><span /><span />
      </div>
    </div>
  )
}
