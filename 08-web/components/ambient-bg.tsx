export default function AmbientBg() {
  const STICKERS = [
    { kind: 'fork', top: '6%', left: '4%', size: 52, rot: -18 },
    { kind: 'pill', top: '18%', left: '12%', size: 40, rot: 22 },
    { kind: 'cart', top: '40%', left: '3%', size: 46, rot: -12 },
    { kind: 'moped', top: '60%', left: '10%', size: 44, rot: 16 },
    { kind: 'star', top: '78%', left: '5%', size: 34, rot: -22 },
    { kind: 'heart', top: '88%', left: '14%', size: 36, rot: 18 },
    { kind: 'coffee', top: '25%', left: '20%', size: 32, rot: -10 },
    { kind: 'fork', top: '10%', right: '5%', size: 50, rot: 14 },
    { kind: 'pill', top: '28%', right: '12%', size: 38, rot: -20 },
    { kind: 'cart', top: '52%', right: '6%', size: 48, rot: 12 },
    { kind: 'moped', top: '72%', right: '14%', size: 42, rot: -14 },
    { kind: 'star', top: '45%', right: '3%', size: 32, rot: 20 },
    { kind: 'heart', top: '15%', right: '18%', size: 28, rot: -16 },
    { kind: 'coffee', top: '65%', right: '8%', size: 34, rot: 22 },
    { kind: 'fork', top: '92%', right: '20%', size: 30, rot: -8 },
    { kind: 'star', top: '55%', left: '18%', size: 26, rot: 25 },
  ]
  const c = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  function S({ kind }: { kind: string }) {
    if (kind === 'fork') return <svg viewBox="0 0 24 24" {...c}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
    if (kind === 'pill') return <svg viewBox="0 0 24 24" {...c}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>
    if (kind === 'cart') return <svg viewBox="0 0 24 24" {...c}><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12.5a2 2 0 0 0 2 1.5h8.5a2 2 0 0 0 2-1.6L22 7H6"/></svg>
    if (kind === 'moped') return <svg viewBox="0 0 24 24" {...c}><circle cx="5" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M5 18h10M15 18h2M14 6h4l2 6h-2M4 6h4v4"/></svg>
    if (kind === 'star') return <svg viewBox="0 0 24 24" {...c}><path d="M12 2l3 6.5 7 1-5 4.8 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.5l7-1z"/></svg>
    if (kind === 'heart') return <svg viewBox="0 0 24 24" {...c}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
    if (kind === 'coffee') return <svg viewBox="0 0 24 24" {...c}><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>
    return null
  }
  return (
    <div className="ambient-bg" aria-hidden>
      {STICKERS.map((s, i) => {
        const st: React.CSSProperties = {
          top: s.top,
          width: s.size,
          height: s.size,
          transform: `rotate(${s.rot}deg)`,
        }
        if ('left' in s) st.left = (s as any).left
        if ('right' in s) st.right = (s as any).right
        return <span key={i} className="ambient-bg__item" style={st}><S kind={s.kind} /></span>
      })}
    </div>
  )
}
