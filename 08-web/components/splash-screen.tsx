'use client'

export default function SplashScreen() {
  return (
    <div className="splash">
      <div className="splash__glow" aria-hidden />
      <div className="splash__logo-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/eah-crown.webp"
          alt=""
          className="splash__crown"
          aria-hidden
          width={64}
          height={64}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/eah-word.webp"
          alt="EAH — اللي نفسك فيه"
          className="splash__word"
          width={160}
          height={64}
        />
      </div>
    </div>
  )
}
