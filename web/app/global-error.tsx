'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    void fetch('/api/log-error', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        severity: 'critical',
      }),
      keepalive: true,
    }).catch(() => {})
  }, [error])

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          background: '#07020D',
          color: '#F4F2FA',
          fontFamily: 'system-ui, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>الموقع وقع</h1>
          <p style={{ color: '#A29DB5', marginBottom: '1.5rem' }}>جرب تحدّث الصفحة.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 12,
              background: 'rgba(168,85,247,0.15)',
              border: '1px solid rgba(168,85,247,0.35)',
              color: '#F4F2FA',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            حاول تاني
          </button>
        </div>
      </body>
    </html>
  )
}
