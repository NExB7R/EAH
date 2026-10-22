'use client'

import Link from 'next/link'
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
    <main
      dir="rtl"
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        color: 'var(--text-primary)',
      }}
    >
      <section
        style={{
          width: 'min(100%, 460px)',
          textAlign: 'center',
          padding: 'clamp(24px, 5vw, 40px)',
          borderRadius: 24,
          background: 'linear-gradient(155deg, rgba(24, 17, 38, .96), rgba(10, 7, 20, .98))',
          border: '1px solid rgba(168, 85, 247, .22)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, .24)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 60,
            height: 60,
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 18px',
            borderRadius: 20,
            background: 'rgba(168, 85, 247, .12)',
            color: '#d8b4fe',
            fontSize: 28,
            fontWeight: 900,
          }}
        >
          E
        </div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 10px' }}>
          الصفحة دي مش متاحة دلوقتي
        </h1>
        <p
          style={{
            color: 'var(--text-tertiary)',
            fontSize: '.95rem',
            lineHeight: 1.9,
            margin: '0 0 24px',
          }}
        >
          حصلت مشكلة مؤقتة، لكن تقدر تحاول تاني أو ترجع للرئيسية وتكمل استخدام المنصة.
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
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '11px 20px',
              borderRadius: 12,
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.12)',
              color: 'var(--text-primary)',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            الرجوع للرئيسية
          </Link>
        </div>
      </section>
    </main>
  )
}
