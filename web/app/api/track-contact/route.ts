import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createHash } from 'crypto'

const schema = z.object({
  businessId: z.string().uuid(),
  method: z.enum(['phone', 'whatsapp']),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  // visitor_hash = sha256(user.id + business.id + method)
  // يمنع التضخيم من نفس المستخدم
  const visitorHash = createHash('sha256')
    .update(`${user.id}:${parsed.data.businessId}:${parsed.data.method}`)
    .digest('hex')

  // Only the authenticated server route can submit the derived hash; the database
  // RPC is restricted to service_role so clients cannot forge arbitrary visitor hashes.
  const serviceClient = createServiceClient()
  const { error } = await serviceClient.rpc('reveal_contact', {
    p_business_id: parsed.data.businessId,
    p_method_type: parsed.data.method,
    p_visitor_hash: visitorHash,
  })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
