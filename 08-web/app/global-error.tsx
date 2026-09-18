'use client'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{background:'#07060B',color:'#F5F3FF',fontFamily:'system-ui',margin:0}}>
        <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px',textAlign:'center'}}>
          <div>
            <h1 style={{fontSize:'2rem',margin:'0 0 12px'}}><IcAlert /> حصل خطأ</h1>
            <p style={{color:'#A5A3B8',marginBottom:'24px'}}>حاول تحدّث الصفحة.</p>
            <button onClick={reset} style={{padding:'12px 24px',borderRadius:'14px',background:'#A855F7',color:'#fff',fontWeight:800,border:'none',cursor:'pointer',fontFamily:'inherit'}}>حاول تاني</button>
          </div>
        </main>
      </body>
    </html>
  )
}
