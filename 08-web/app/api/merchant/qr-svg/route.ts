import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getMerchantContext } from '@/lib/admin/merchant-guard'
import QRCode from 'qrcode'

export const dynamic = 'force-dynamic'

export async function GET() {
  const ctx = await getMerchantContext()
  if (!ctx || ctx.businesses.length === 0) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const biz = ctx.businesses[0]
  const url = `https://eah-sq.vercel.app/businesses/${biz.slug}`

  const svg = await QRCode.toString(url, {
    type: 'svg',
    width: 800,
    margin: 2,
    color: { dark: '#A855F7', light: '#07060B' },
  })

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': `attachment; filename="${biz.slug}-qr.svg"`,
    },
  })
}
