import { NextResponse } from 'next/server'
import { getPublishedBusinesses } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const businesses = await getPublishedBusinesses(50)
    return NextResponse.json({
      ok: true,
      count: businesses.length,
      slugs: businesses.map(b => b.slug),
      first: businesses[0] ?? null,
    })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e?.message ?? String(e),
      stack: e?.stack,
    }, { status: 500 })
  }
}
