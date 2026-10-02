import { ImageResponse } from 'next/og'
import { getOgFonts } from '@/lib/og/fonts'
import { getBusinessDetail, TYPE_LABEL } from '@/lib/data/business-detail'

// ═══════════════════════════════════════════════════════════
// EAH — Business OG Image
// ═══════════════════════════════════════════════════════════

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'EAH — نشاط'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function Image({ params }: Props) {
  const { slug } = await params
  const [detail, fonts] = await Promise.all([getBusinessDetail(slug), getOgFonts()])

  const name = detail?.business.name ?? 'EAH'
  const type = detail?.business.business_type
    ? (TYPE_LABEL[detail.business.business_type] ?? 'نشاط')
    : 'نشاط'
  const area = detail?.business.area ?? 'شبين القناطر'
  const hook = detail?.business.hook ?? detail?.business.description ?? null
  const isFeatured = detail?.business.is_featured ?? false
  const rating = detail?.business.rating_count ? detail.business.rating_avg.toFixed(1) : null

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'radial-gradient(circle at 70% 20%, #1a0a2e 0%, #0a0514 50%, #07020D 100%)',
        fontFamily: 'Noto',
        padding: '70px 80px',
        position: 'relative',
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: 600,
          height: 400,
          background: isFeatured
            ? 'radial-gradient(ellipse, rgba(232, 199, 154, 0.3), transparent 70%)'
            : 'radial-gradient(ellipse, rgba(168, 85, 247, 0.3), transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            borderRadius: 999,
            background: isFeatured ? 'rgba(232, 199, 154, 0.15)' : 'rgba(168, 85, 247, 0.15)',
            border: isFeatured
              ? '1px solid rgba(232, 199, 154, 0.5)'
              : '1px solid rgba(168, 85, 247, 0.5)',
            color: isFeatured ? '#F5D9A7' : '#C77DFF',
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {isFeatured && <span>👑</span>}
          <span>{isFeatured ? 'مميز' : type}</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 22,
            color: '#7B7490',
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}
        >
          EAH
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          zIndex: 1,
        }}
      >
        {/* Meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 24,
            color: '#A29DB5',
          }}
        >
          <span>📍 {area}</span>
          {rating && (
            <>
              <span style={{ color: '#4A4555' }}>·</span>
              <span style={{ color: '#E8C79A' }}>⭐ {rating}</span>
            </>
          )}
        </div>

        {/* Name */}
        <div
          style={{
            display: 'flex',
            fontSize: 84,
            fontWeight: 700,
            color: isFeatured ? '#F5D9A7' : '#F4F2FA',
            lineHeight: 1.15,
            maxWidth: 1000,
            textShadow: isFeatured
              ? '0 0 30px rgba(232, 199, 154, 0.4)'
              : '0 0 30px rgba(199, 125, 255, 0.3)',
          }}
        >
          {name}
        </div>

        {/* Hook */}
        {hook && (
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              color: '#C9C2DB',
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            {hook.length > 90 ? `${hook.slice(0, 90)}…` : hook}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 22,
            color: '#7B7490',
          }}
        >
          <span style={{ color: '#C77DFF', fontSize: 26 }}>EAH</span>
          <span>— اللى نفسك فيه ؟</span>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 20,
            color: '#7B7490',
            fontWeight: 700,
          }}
        >
          eah-sq.vercel.app
        </div>
      </div>
    </div>,
    { ...size, fonts },
  )
}
