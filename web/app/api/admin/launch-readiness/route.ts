import { NextResponse } from 'next/server'
import { computeLaunchReadiness } from '@/lib/data/launch-readiness'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET() {
  try {
    const result = await computeLaunchReadiness()
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: 'فشل الحساب', message: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 },
    )
  }
}
