import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { sendPushToUser } from '@/lib/push/send'
import { checkRate, getClientIp } from '@/lib/security/rate-limit'
import { z } from 'zod'
import { UUID } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  type: z.enum(['review', 'reveal', 'offer', 'custom']),
  businessId: UUID,
  title: z.string().max(120).optional(),
  body: z.string().max(300).optional(),
  url: z.string().max(300).optional(),
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { ok } = checkRate(`push-notify:${ip}`, 15, 60_000)
  if (!ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return NextResponse.json({ ok: false }, { status: 401 })

  const raw = await request.json().catch(() => null)
  const parsed = BodySchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })

  const data = parsed.data

  const { data: biz } = await supabase
    .from('businesses')
    .select('owner_profile_id,name,slug')
    .eq('id', data.businessId)
    .maybeSingle()

  if (!biz?.owner_profile_id) return NextResponse.json({ ok: false, error: 'no_owner' })

  const result = await sendPushToUser(biz.owner_profile_id, {
    type: data.type ?? 'merchant_orders',
    title: data.title ?? 'إشعار جديد من EAH',
    body: data.body ?? '',
    url: data.url ?? `/merchant/businesses/${biz.slug}/report`,
  })

  return NextResponse.json({ ok: true, ...result })
}
