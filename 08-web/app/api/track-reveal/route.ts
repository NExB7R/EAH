import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { checkRate, getClientIp } from '@/lib/security/rate-limit'

const Schema = z.object({
  business_id: z.string().uuid(),
  method_type: z.enum(['phone', 'whatsapp', 'email', 'website', 'instagram', 'facebook']),
})

export async function POST(request: Request) {
  const rate = checkRate(`track-reveal:${getClientIp(request)}`, 40, 60_000)
  if (!rate.ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  try {
    const parsed = Schema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })

    const supabase = await createClient()
    const { error } = await supabase.from('page_view_events').insert({
      business_id: parsed.data.business_id,
      path: `contact-reveal:${parsed.data.method_type}`,
      event_scope: 'contact_reveal',
    })

    return NextResponse.json({ ok: !error })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
