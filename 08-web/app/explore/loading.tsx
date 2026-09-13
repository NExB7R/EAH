export default function Loading() {
  return (
    <main style={{maxWidth:1200,margin:'0 auto',padding:'100px 20px 60px'}}>
      <div style={{marginBottom:24,textAlign:'center'}}>
        <div className="skel-line" style={{width:200,height:32,margin:'0 auto 12px'}} />
        <div className="skel-line" style={{width:280,height:16,margin:'0 auto'}} />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))',gap:16}}>
        {Array.from({length:8}).map((_,i) => (
          <div key={i} className="skel-card">
            <div className="skel-card__media" />
            <div className="skel-card__body">
              <div className="skel-line" style={{width:'70%'}} />
              <div className="skel-line" style={{width:'40%',opacity:.6}} />
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .skel-line { background: rgba(139,92,246,.1); border-radius: 8px; height: 14px; margin-bottom: 6px; animation: skelPulse 1.6s ease-in-out infinite; }
        .skel-card { background: rgba(20,18,28,.6); border: 1px solid rgba(139,92,246,.12); border-radius: 20px; overflow: hidden; }
        .skel-card__media { height: 140px; background: rgba(139,92,246,.08); animation: skelPulse 1.6s ease-in-out infinite; }
        .skel-card__body { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
        @keyframes skelPulse { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
      `}</style>
    </main>
  )
}
