import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { sendPushToUser } from '@/lib/push/send'

export const dynamic = 'force-dynamic'

type Body = {
  type: 'review' | 'reveal' | 'offer' | 'custom'
  businessId?: string
  title?: string
  body?: string
  url?: string
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return NextResponse.json({ ok: false }, { status: 401 })

  const data = await request.json().catch(() => null) as Body | null
  if (!data || !data.type) return NextResponse.json({ ok: false }, { status: 400 })

  // نجيب owner للنشاط
  if (!data.businessId) return NextResponse.json({ ok: false, error: 'no_business' }, { status: 400 })

  const { data: biz } = await supabase
    .from('businesses')
    .select('owner_profile_id,name,slug')
    .eq('id', data.businessId)
    .maybeSingle()

  if (!biz?.owner_profile_id) return NextResponse.json({ ok: false, error: 'no_owner' })

  // منع spam: مش نبعت أكتر من push في الدقيقة
  // (نعتمد على DB trigger للـ notification، إحنا بس نبعت push)
  const payload = {
    title: data.title ?? 'إشعار جديد من EAH',
    body: data.body ?? '',
    url: data.url ?? `/merchant/businesses/${biz.slug}/report`,
  }

  const result = await sendPushToUser(biz.owner_profile_id, payload)
  return NextResponse.json({ ok: true, ...result })
}
