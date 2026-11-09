import { NextResponse } from 'next/server'
import { fixHealthIssue } from '@/lib/data/health-fixes'

export const dynamic = 'force-dynamic'

const FIXABLE = ['published-without-branch', 'orphan-branches', 'stale-orders']

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { checkId?: string }
    if (!body.checkId || !FIXABLE.includes(body.checkId)) {
      return NextResponse.json({ ok: false, error: 'معرّف غير صالح' }, { status: 400 })
    }
    const result = await fixHealthIssue(body.checkId)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'فشل' },
      { status: 500 },
    )
  }
}
