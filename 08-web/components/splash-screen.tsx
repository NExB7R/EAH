import './splash-screen.css'

export default function SplashScreen() {
  return (
    <div className="spl" aria-hidden>
      <div className="spl__logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/eah-word.webp" alt="" className="spl__word" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/eah-crown.webp" alt="" className="spl__crown" />
      </div>
      <span className="spl__slogan">اللي نفسك فيه ؟</span>
    </div>
  )
}
