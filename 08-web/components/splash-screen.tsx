import './splash-screen.css'

export default function SplashScreen() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        html body > .spl {
          position: fixed !important;
          inset: 0 !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100dvh !important;
          z-index: 2147483647 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 22px !important;
          background: #07020D !important;
          background-image:
            radial-gradient(ellipse at 50% 30%, rgba(168, 85, 247, 0.18), transparent 60%),
            radial-gradient(ellipse at 50% 100%, rgba(232, 199, 154, 0.06), transparent 55%),
            linear-gradient(180deg, #07020D 0%, #0A0514 50%, #07020D 100%) !important;
          overflow: hidden !important;
          pointer-events: none !important;
          animation: splHide 200ms ease 1000ms forwards !important;
        }
        @keyframes splHide { to { opacity: 0; visibility: hidden; } }
      `}} />
      <div className="spl" aria-hidden>
        <div className="spl__logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eah-word.webp" alt="" className="spl__word" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eah-crown.webp" alt="" className="spl__crown" />
        </div>
        <span className="spl__slogan">اللي نفسك فيه ؟</span>
      </div>
    </>
  )
}
