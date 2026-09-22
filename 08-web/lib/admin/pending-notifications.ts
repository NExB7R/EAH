import 'server-only'
import { createServiceClient } from '@/lib/supabase-server'
import { sendPushToUser } from '@/lib/push/send'

const ACTION_LABEL: Record<string, string> = {
  'business.update': 'تعديل النشاط',
  'business.delete': 'حذف النشاط',
  'business.images_change': 'تغيير الصور',
  'offer.update': 'تعديل العرض',
  'offer.delete': 'حذف العرض',
  'profile.update': 'تعديل البروفايل',
}

export async function notifyPendingDecision(
  pendingId: string,
  status: 'approved' | 'rejected',
  note?: string,
): Promise<'sent' | 'not_found'> {
  const supabase = createServiceClient()
  const { data: pending } = await supabase
    .from('pending_changes')
    .select('id, requested_by, action')
    .eq('id', pendingId)
    .maybeSingle()

  if (!pending) return 'not_found'

  const label = ACTION_LABEL[pending.action] ?? pending.action
  const isApproved = status === 'approved'
  const title = isApproved ? `تم اعتماد ${label}` : `تم رفض ${label}`
  const body = isApproved
    ? 'التعديل اتنشر — شوف نشاطك على EAH'
    : note?.trim()
      ? `السبب: ${note.trim().slice(0, 100)}`
      : 'تم رفض التعديل — شوف التفاصيل في طلباتي'

  await sendPushToUser(pending.requested_by, {
    type: 'order_updates',
    title,
    body,
    url: '/merchant/pending',
  })

  return 'sent'
}
