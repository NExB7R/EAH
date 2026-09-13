'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <main style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'80px 20px',textAlign:'center'}}>
      <div>
        <div style={{fontSize:'5rem',marginBottom:'16px'}}>⚠️</div>
        <h1 style={{fontSize:'1.8rem',fontWeight:900,color:'#F5F3FF',margin:'0 0 12px'}}>حصل خطأ</h1>
        <p style={{color:'#A5A3B8',marginBottom:'24px'}}>حاول تاني، ولو المشكلة مستمرة كلمنا.</p>
        <button onClick={reset} style={{padding:'12px 24px',borderRadius:'14px',background:'linear-gradient(135deg,#8B5CF6,#A855F7)',color:'#fff',fontWeight:800,border:'none',cursor:'pointer',fontSize:'0.95rem',fontFamily:'inherit'}}>حاول تاني</button>
      </div>
    </main>
  )
}
