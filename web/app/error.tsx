'use client'

import { useEffect } from 'react'
import { reportError } from '@/lib/logging/client'

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportError({
      message: error.message,
      stack: error.stack,
      severity: 'high',
    })
  }, [error])

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>حصلت مشكلة</h2>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
        جرب تحدّث الصفحة، ولو المشكلة استمرت كلّمنا.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding: '0.6rem 1.2rem',
          borderRadius: 12,
          background: 'rgba(168,85,247,0.12)',
          border: '1px solid rgba(168,85,247,0.28)',
          color: 'var(--text-primary)',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        حاول تاني
      </button>
    </div>
  )
}
