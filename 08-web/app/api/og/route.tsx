import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase-server'

export const runtime = 'edge'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const slug = url.searchParams.get('slug')
  if (!slug) return new Response('missing slug', { status: 400 })

  let name = 'EAH'
  let area = 'شبين القناطر'
  let type = 'مكان'

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('businesses')
      .select('name,area,business_type')
      .eq('slug', slug)
      .maybeSingle()
    if (data) {
      name = data.name
      area = data.area ?? area
      const t: Record<string, string> = {
        restaurant: 'مطعم', pharmacy: 'صيدلية', delivery_office: 'توصيل'
      }
      type = t[data.business_type] ?? 'مكان'
    }
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #07060B 0%, #1a1030 100%)',
          fontFamily: 'system-ui',
          padding: 60,
        }}
      >
        <div style={{ fontSize: 60, marginBottom: 20 }}>⭐</div>
        <div style={{ fontSize: 68, fontWeight: 900, color: '#F5F3FF', marginBottom: 12, textAlign: 'center' }}>
          {name}
        </div>
        <div style={{ fontSize: 32, color: '#A855F7', fontWeight: 700, marginBottom: 30 }}>
          {type} · {area}
        </div>
        <div style={{ fontSize: 28, color: '#A5A3B8' }}>
          على EAH — اللى نفسك فيه ؟
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
