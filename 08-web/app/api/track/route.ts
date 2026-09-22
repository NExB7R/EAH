import { NextResponse } from 'next/server'
import { z } from 'zod'
import { trackEvent } from '@/lib/analytics/track'
import { checkRate, getClientIp } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'

const Schema = z.object({
  scope: z.enum(['business_view', 'business_reveal', 'order_start', 'order_confirm', 'cta_click', 'search_query']),
  businessId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.string().max(60), z.union([z.string().max(500), z.number(), z.boolean(), z.null()]))
    .refine((value) => Object.keys(value).length <= 20)
    .optional(),
})

export async function POST(request: Request) {
  const rate = checkRate(`track:${getClientIp(request)}`, 120, 60_000)
  if (!rate.ok) return NextResponse.json({ ok: false }, { status: 429 })

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > 16_384) return NextResponse.json({ ok: false }, { status: 413 })

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
