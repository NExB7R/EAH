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
          margin: 0,
          background: '#07020D',
          color: '#F4F2FA',
          fontFamily: 'system-ui, sans-serif',
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
        }}
      >
        <main
          style={{
            width: 'min(100%, 460px)',
            textAlign: 'center',
            padding: 'clamp(24px, 5vw, 40px)',
            borderRadius: 24,
            background: 'linear-gradient(155deg, rgba(24, 17, 38, .96), rgba(10, 7, 20, .98))',
            border: '1px solid rgba(168, 85, 247, .22)',
            boxShadow: '0 24px 80px rgba(0, 0, 0, .3)',
          }}
        >
          <div aria-hidden="true" style={{ fontSize: 28, fontWeight: 900, color: '#d8b4fe', marginBottom: 18 }}>
            EAH
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 10px' }}>
            حصلت مشكلة مؤقتة
          </h1>
          <p style={{ color: '#A29DB5', margin: '0 0 24px', lineHeight: 1.9 }}>
            مش قادرين نفتح الصفحة حاليًا. جرّب تاني أو ارجع للرئيسية وكمل تصفح المنصة.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '11px 20px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                border: '1px solid rgba(216, 180, 254, .35)',
                color: '#fff',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              حاول تاني
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '11px 20px',
                borderRadius: 12,
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.12)',
                color: '#F4F2FA',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              الرجوع للرئيسية
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
