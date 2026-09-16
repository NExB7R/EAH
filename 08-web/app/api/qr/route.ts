import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url') ?? 'https://eah-sq.vercel.app'
  const size = Math.min(Math.max(Number(searchParams.get('size') ?? 512), 128), 1024)

  try {
    const qr = await import('qrcode')
    const buffer = await qr.toBuffer(url, {
      type: 'png',
      width: size,
      margin: 2,
      color: { dark: '#E8C79A', light: '#0A0714' },
      errorCorrectionLevel: 'M',
    })
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'qr_failed' }, { status: 500 })
  }
}
