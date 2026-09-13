export default function Loading() {
  return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{
        width:40,height:40,borderRadius:'50%',
        border:'3px solid rgba(139,92,246,.2)',
        borderTopColor:'#A855F7',
        animation:'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
