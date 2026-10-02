import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getBusinessDetail } from '@/lib/data/business-detail'

export const alt = 'EAH — نشاط'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const font = await readFile(join(process.cwd(), 'public/fonts/Tajawal-Black.ttf'))

  let name = 'نشاط'
  let area = ''
  let category = ''

  try {
    const biz = await getBusinessDetail(slug)
    if (biz) {
      name = biz.business.name ?? name
      area = biz.business.area ?? ''
      category = ''
    }
  } catch {
    // fallback للأسماء الافتراضية
  }

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
        padding: 60,
      }}
    >
      <div
        style={{
          fontSize: 32,
          color: '#C77DFF',
          fontWeight: 900,
          letterSpacing: 2,
          marginBottom: 30,
        }}
      >
        EAH
      </div>
      <div
        style={{
          fontSize: 90,
          fontWeight: 900,
          color: '#E8C79A',
          textAlign: 'center',
          lineHeight: 1.1,
          maxWidth: 1000,
        }}
      >
        {name}
      </div>
      {(category || area) && (
        <div
          style={{
            marginTop: 30,
            fontSize: 36,
            color: '#A29DB5',
            display: 'flex',
            gap: 20,
          }}
        >
          {category && <span>{category}</span>}
          {category && area && <span style={{ color: '#4A4555' }}>•</span>}
          {area && <span>{area}</span>}
        </div>
      )}
      <div
        style={{
          marginTop: 50,
          width: 120,
          height: 3,
          background: 'linear-gradient(90deg, transparent, #E8C79A, transparent)',
        }}
      />
    </div>,
    {
      ...size,
      fonts: [{ name: 'Tajawal', data: font, weight: 900, style: 'normal' }],
    },
  )
}
