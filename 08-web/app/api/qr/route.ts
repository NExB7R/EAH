import { NextResponse } from 'next/server'
import { checkRateDb, getClientIp } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const rate = await checkRateDb(`qr:${getClientIp(request)}`, 60, 60_000)
  if (!rate.ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  const { searchParams } = new URL(request.url)
  const rawUrl = searchParams.get('url') ?? 'https://eah-sq.vercel.app'
  const parsedSize = Number(searchParams.get('size') ?? 512)
  const size = Number.isFinite(parsedSize) ? Math.min(Math.max(Math.round(parsedSize), 128), 1024) : 512

  if (rawUrl.length > 2048) {
    return NextResponse.json({ ok: false, error: 'url_too_long' }, { status: 400 })
  }

  try {
    const target = new URL(rawUrl)
    if (target.protocol !== 'https:' && target.protocol !== 'http:') {
      return NextResponse.json({ ok: false, error: 'invalid_url' }, { status: 400 })
    }

    const qr = await import('qrcode')
    const buffer = await qr.toBuffer(target.toString(), {
      type: 'png',
      width: size,
      margin: 2,
      color: { dark: '#E8C79A', light: '#0A0714' },
      errorCorrectionLevel: 'M',
    })
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'qr_failed' }, { status: 400 })
  }
}
