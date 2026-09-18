export default function Loading() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '120px 20px 60px',
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '3px solid rgba(168, 85, 247, 0.2)',
        borderTopColor: '#A855F7',
        animation: 'eahl-spin 0.8s linear infinite',
      }} />
      <style>{`
        @keyframes eahl-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
