import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'نفسك في إيه؟ — EAH'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #07060B 0%, #1a1030 100%)',
        fontFamily: 'system-ui, sans-serif', padding: 60,
      }}>
        <div style={{ fontSize: 100, marginBottom: 20 }}>✨</div>
        <div style={{
          fontSize: 72, fontWeight: 900, color: '#F5F3FF', marginBottom: 12,
          textAlign: 'center',
        }}>نفسك في إيه؟</div>
        <div style={{ fontSize: 34, color: '#A855F7', fontWeight: 700, marginBottom: 30 }}>
          ترشيحات ذكية على مزاجك
        </div>
        <div style={{ fontSize: 24, color: '#A5A3B8' }}>eah-sq.vercel.app</div>
      </div>
    ),
    { ...size }
  )
}
