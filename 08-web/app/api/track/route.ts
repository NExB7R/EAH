import { NextResponse } from 'next/server'
import { z } from 'zod'
import { trackEvent } from '@/lib/analytics/track'

export const runtime = 'edge'

const Schema = z.object({
  scope: z.enum(['business_view', 'business_reveal', 'order_start', 'order_confirm', 'cta_click', 'search_query']),
  businessId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

    await trackEvent({
      scope: parsed.data.scope,
      businessId: parsed.data.businessId ?? null,
      metadata: parsed.data.metadata,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
