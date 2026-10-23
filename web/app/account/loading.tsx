export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '24px 0',
      }}
      role="status"
      aria-live="polite"
      aria-label="جاري التحميل"
    >
      {/* Skeleton header */}
      <div
        style={{
          height: 32,
          width: '60%',
          maxWidth: 320,
          borderRadius: 8,
          background: 'rgba(168, 85, 247, 0.08)',
          animation: 'skeletonPulse 1.4s ease-in-out infinite',
        }}
      />
      {/* Skeleton cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 96,
              borderRadius: 14,
              background: 'rgba(168, 85, 247, 0.05)',
              border: '1px solid rgba(168, 85, 247, 0.1)',
              animation: 'skeletonPulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      {/* Skeleton list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: 72,
              borderRadius: 12,
              background: 'rgba(168, 85, 247, 0.04)',
              border: '1px solid rgba(168, 85, 247, 0.08)',
              animation: 'skeletonPulse 1.4s ease-in-out infinite',
              animationDelay: `${0.3 + i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
