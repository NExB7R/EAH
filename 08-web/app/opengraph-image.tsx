import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'EAH — Local Discovery Platform'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #07060B 0%, #1a0f2e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            background:
              'radial-gradient(circle at 25% 25%, rgba(168,85,247,0.30), transparent 55%), radial-gradient(circle at 75% 75%, rgba(139,92,246,0.25), transparent 55%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 220,
            fontWeight: 900,
            letterSpacing: '-0.06em',
            color: '#A855F7',
            lineHeight: 1,
          }}
        >
          EAH
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 34,
            color: '#C4B5FD',
            marginTop: 40,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Local Discovery · Shibin El-Qanater
        </div>
      </div>
    ),
    { ...size }
  )
}
