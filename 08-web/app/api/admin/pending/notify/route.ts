import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { sendPushToUser } from '@/lib/push/send'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  pendingId: z.string().uuid(),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

  const supabase = await createServiceClient()

  // اجلب الطلب
  const { data: pending } = await supabase
    .from('pending_changes')
    .select('id, action, entity_type, requested_by, payload')
    .eq('id', parsed.data.pendingId)
    .eq('status', 'pending')
    .maybeSingle()

  if (!pending) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })

  // اجلب كل السوبر أدمنز
  const { data: admins } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'super_admin')

  if (!admins || admins.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  // اجلب اسم مقدم الطلب
  const { data: requester } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', pending.requested_by)
    .maybeSingle()

  const requesterName = requester?.display_name ?? 'مستخدم'

  let sent = 0
  for (const admin of admins) {
    // متبعتش لنفس الشخص اللي عمل الطلب
    if (admin.user_id === pending.requested_by) continue

    try {
      await sendPushToUser(admin.user_id, {
        title: `طلب معلق جديد: ${pending.action}`,
        body: `${requesterName} محتاج موافقة على ${pending.entity_type}`,
        url: '/admin/pending',
      })
      sent++
    } catch {
      // silent
    }
  }

  return NextResponse.json({ ok: true, sent })
}
