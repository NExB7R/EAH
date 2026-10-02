import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'EAH اللى نفسك فيه ؟'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG() {
  const font = await readFile(join(process.cwd(), 'public/fonts/Tajawal-Black.ttf'))

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 30%, #2a0b4a 0%, #07020D 60%)',
        fontFamily: 'Tajawal',
        position: 'relative',
      }}
    >
      <div
        style={{
          fontSize: 220,
          fontWeight: 900,
          color: '#C77DFF',
          letterSpacing: -8,
          lineHeight: 1,
          textShadow: '0 0 60px rgba(168,85,247,0.6)',
        }}
      >
        EAH
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: 56,
          fontWeight: 900,
          color: '#E8C79A',
        }}
      >
        اللى نفسك فيه ؟
      </div>
      <div
        style={{
          marginTop: 40,
          width: 120,
          height: 3,
          background: 'linear-gradient(90deg, transparent, #E8C79A, transparent)',
        }}
      />
      <div
        style={{
          marginTop: 30,
          fontSize: 28,
          color: '#A29DB5',
        }}
      >
        من قلب شبين القناطر
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: 'Tajawal', data: font, weight: 900, style: 'normal' }],
    },
  )
}
