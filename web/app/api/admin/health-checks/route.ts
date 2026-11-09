import { NextResponse } from 'next/server'
import { runHealthChecks } from '@/lib/data/health-checks'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET() {
  try {
    const result = await runHealthChecks()
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      {
        error: 'فشل تشغيل الفحوصات',
        message: err instanceof Error ? err.message : 'Unknown',
      },
      { status: 500 },
    )
  }
}
