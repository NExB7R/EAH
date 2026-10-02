import { ImageResponse } from 'next/og'
import { getOgFonts } from '@/lib/og/fonts'

// ═══════════════════════════════════════════════════════════
// EAH — Root OG Image
// ═══════════════════════════════════════════════════════════

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'EAH — اللى نفسك فيه ؟'

export default async function Image() {
  const fonts = await getOgFonts()

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 30%, #1a0a2e 0%, #0a0514 50%, #07020D 100%)',
        fontFamily: 'Noto',
        padding: '60px',
        position: 'relative',
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(168, 85, 247, 0.35), transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 18px',
          borderRadius: 999,
          background: 'rgba(232, 199, 154, 0.12)',
          border: '1px solid rgba(232, 199, 154, 0.4)',
          color: '#E8C79A',
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 28,
          zIndex: 1,
        }}
      >
        <span>⭐</span>
        <span>منصة اكتشاف محلية</span>
      </div>

      {/* Title */}
      <div
        style={{
          display: 'flex',
          fontSize: 128,
          fontWeight: 700,
          color: '#C77DFF',
          letterSpacing: '0.15em',
          lineHeight: 1,
          marginBottom: 20,
          zIndex: 1,
          textShadow: '0 0 40px rgba(168, 85, 247, 0.6)',
        }}
      >
        EAH
      </div>

      {/* Slogan */}
      <div
        style={{
          display: 'flex',
          fontSize: 52,
          fontWeight: 700,
          color: '#F5D9A7',
          marginBottom: 26,
          zIndex: 1,
        }}
      >
        اللى نفسك فيه ؟
      </div>

      {/* Subtitle */}
      <div
        style={{
          display: 'flex',
          fontSize: 28,
          color: '#C9C2DB',
          textAlign: 'center',
          maxWidth: 900,
          lineHeight: 1.5,
          zIndex: 1,
        }}
      >
        اكتشف، اطلب، قيّم — من قلب شبين القناطر
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#7B7490',
          fontSize: 20,
          zIndex: 1,
        }}
      >
        <span>eah-sq.vercel.app</span>
      </div>
    </div>,
    { ...size, fonts },
  )
}
