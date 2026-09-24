export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#07020D',
      color: '#F4F2FA',
      fontFamily: 'system-ui',
      padding: 20,
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #C084FC, #F5D9A7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 12,
        }}>
          EAH
        </h1>
        <p style={{ color: '#A29DB5' }}>
          اللي نفسك فيه ؟
        </p>
        <p style={{
          marginTop: 24,
          fontSize: '0.75rem',
          color: '#7B7490',
        }}>
          Fresh start v2 — 2026-09-24
        </p>
      </div>
    </main>
  )
}
