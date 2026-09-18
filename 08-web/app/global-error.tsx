'use client'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{background:'#07060B',color:'#F5F3FF',fontFamily:'system-ui',margin:0}}>
        <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px',textAlign:'center'}}>
          <div>
            <h1 style={{fontSize:'2rem',margin:'0 0 12px'}}><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline",verticalAlign:"middle",marginLeft:8}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> حصل خطأ</h1>
            <p style={{color:'#A5A3B8',marginBottom:'24px'}}>حاول تحدّث الصفحة.</p>
            <button onClick={reset} style={{padding:'12px 24px',borderRadius:'14px',background:'#A855F7',color:'#fff',fontWeight:800,border:'none',cursor:'pointer',fontFamily:'inherit'}}>حاول تاني</button>
          </div>
        </main>
      </body>
    </html>
  )
}
