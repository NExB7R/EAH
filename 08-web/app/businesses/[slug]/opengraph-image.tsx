import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'EAH Business'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const TYPE_EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  supermarket: '🛒',
  delivery_office: '🛵',
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'Restaurant',
  pharmacy: 'Pharmacy',
  supermarket: 'Supermarket',
  delivery_office: 'Delivery',
}

async function fetchBiz(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return null
  try {
    const res = await fetch(
      `${url}/rest/v1/businesses?slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&select=name,area,business_type,hook&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: 'force-cache',
      }
    )
    if (!res.ok) return null
    const arr = (await res.json()) as Array<{
      name: string
      area: string | null
      business_type: string
      hook: string | null
    }>
    return arr[0] ?? null
  } catch {
    return null
  }
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const biz = await fetchBiz(slug)

  const name = biz?.name ?? 'EAH'
  const area = biz?.area ?? 'Shibin El-Qanater'
  const type = biz?.business_type ?? 'restaurant'
  const hook = biz?.hook ?? ''
  const emoji = TYPE_EMOJI[type] ?? '🏪'
  const typeLabel = TYPE_LABEL[type] ?? 'Business'

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
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            background:
              'radial-gradient(circle at 30% 30%, rgba(168,85,247,0.25), transparent 55%), radial-gradient(circle at 70% 70%, rgba(107,33,255,0.22), transparent 55%)',
          }}
        />
        <div style={{ display: 'flex', fontSize: 100, marginBottom: 24 }}>
          {emoji}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 68,
            fontWeight: 900,
            color: '#F5F0E8',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: 16,
            maxWidth: 900,
          }}
        >
          {name}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 26,
            color: '#C4B5FD',
          }}
        >
          <span>{area}</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>{typeLabel}</span>
        </div>
        {hook && (
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#A78BFA',
              marginTop: 20,
              opacity: 0.9,
              textAlign: 'center',
              maxWidth: 900,
            }}
          >
            {hook}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 44,
            right: 60,
            display: 'flex',
            fontSize: 32,
            fontWeight: 900,
            color: '#A855F7',
          }}
        >
          EAH
        </div>
      </div>
    ),
    { ...size }
  )
}
