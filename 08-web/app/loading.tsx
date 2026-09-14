// Loading placeholder — minimal, no splash to avoid double-splash
export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <div className="loading-pulse" aria-hidden />
    </div>
  )
}
