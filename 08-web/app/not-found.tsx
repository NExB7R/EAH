import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'

export default function NotFound() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'80px 20px',textAlign:'center'}}>
        <div>
          <div style={{fontSize:'5rem',marginBottom:'16px'}}>🔍</div>
          <h1 style={{fontSize:'2rem',fontWeight:900,color:'#F5F3FF',margin:'0 0 12px'}}>الصفحة مش موجودة</h1>
          <p style={{color:'#A5A3B8',marginBottom:'24px',fontSize:'1rem'}}>يمكن الرابط غلط، أو الصفحة اتنقلت.</p>
          <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/" style={{padding:'12px 24px',borderRadius:'14px',background:'linear-gradient(135deg,#8B5CF6,#A855F7)',color:'#fff',fontWeight:800,textDecoration:'none'}}>الرئيسية</Link>
            <Link href="/explore" style={{padding:'12px 24px',borderRadius:'14px',background:'rgba(139,92,246,.1)',border:'1px solid rgba(139,92,246,.3)',color:'#C4B5FD',fontWeight:800,textDecoration:'none'}}>اكتشف الأماكن</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
