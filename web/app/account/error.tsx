'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertIcon, ArrowLeftIcon } from '@/components/icons'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[page error]', error.message, error.digest ?? '')
  }, [error])

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 440,
          padding: 32,
          borderRadius: 20,
          background: 'linear-gradient(160deg, rgba(20, 14, 34, 0.6), rgba(10, 7, 20, 0.9))',
          border: '1px solid rgba(252, 165, 165, 0.3)',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(252, 165, 165, 0.12)',
            color: '#fca5a5',
            marginBottom: 16,
          }}
        >
          <AlertIcon size={28} />
        </span>
        <h1
          style={{
            margin: '0 0 8px',
            fontFamily: 'var(--font-display, Cairo)',
            fontSize: '1.2rem',
            fontWeight: 900,
            color: 'var(--text-primary, #f5f5f5)',
          }}
        >
          حصلت مشكلة
        </h1>
        <p
          style={{
            margin: '0 0 20px',
            fontSize: '0.85rem',
            color: 'var(--text-muted, #9a8fb8)',
            lineHeight: 1.6,
          }}
        >
          في حاجة غلط حصلت. جرّب تحديث الصفحة، ولو المشكلة مستمرة كلمنا.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              background:
                'linear-gradient(135deg, var(--purple-primary, #9d4edd), var(--purple-neon, #a855f7))',
              color: 'rgb(255, 255, 255)',
              fontFamily: 'var(--font-body, Cairo)',
              fontSize: '0.85rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              minHeight: 40,
            }}
          >
            حاول تاني
          </button>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 10,
              background: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              color: 'var(--text-secondary, #b8aed0)',
              fontFamily: 'var(--font-body, Cairo)',
              fontSize: '0.85rem',
              fontWeight: 800,
              textDecoration: 'none',
              minHeight: 40,
            }}
          >
            <ArrowLeftIcon size={14} />
            <span>الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
