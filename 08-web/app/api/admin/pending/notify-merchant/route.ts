import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { sendPushToUser } from '@/lib/push/send'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  pendingId: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
  note: z.string().max(500).optional(),
})

const ACTION_LABEL: Record<string, string> = {
  'business.update': 'تعديل النشاط',
  'business.delete': 'حذف النشاط',
  'business.images_change': 'تغيير الصور',
  'offer.update': 'تعديل العرض',
  'offer.delete': 'حذف العرض',
  'profile.update': 'تعديل البروفايل',
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

  const supabase = await createServiceClient()

  const { data: pending } = await supabase
    .from('pending_changes')
    .select('id, requested_by, action')
    .eq('id', parsed.data.pendingId)
    .maybeSingle()

  if (!pending) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })

  const label = ACTION_LABEL[pending.action] ?? pending.action
  const isApproved = parsed.data.status === 'approved'

  const title = isApproved ? `✅ تم اعتماد ${label}` : `❌ تم رفض ${label}`
  const body = isApproved
    ? 'التعديل اتنشر — شوف نشاطك على EAH'
    : parsed.data.note
      ? `السبب: ${parsed.data.note.slice(0, 100)}`
      : 'تم رفض التعديل — شوف التفاصيل في طلباتي'

  try {
    await sendPushToUser(pending.requested_by, {
      title,
      body,
      url: '/merchant/pending',
    })
  } catch { /* silent */ }

  return NextResponse.json({ ok: true })
}
