'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { FEEDBACK_ISSUE_TYPES } from '@/lib/data/orders'

// ═══════════════════════════════════════════════════════════════════
// Customer feedback on delivered order — 2 hours after delivery
// ═══════════════════════════════════════════════════════════════════

type Result = { ok: true } | { ok: false; error: string }

const schema = z.object({
  orderId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  issue_type: z.enum(FEEDBACK_ISSUE_TYPES).nullable().optional(),
  text: z.string().max(500).optional().or(z.literal('')),
})

export async function submitOrderFeedback(input: {
  orderId: string
  rating: number
  issue_type: string | null
  text: string
}): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول' }

  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const { data: order } = await supabase
    .from('order_requests')
    .select('id, status, customer_profile_id, delivered_at, feedback_rating')
    .eq('id', parsed.data.orderId)
    .maybeSingle()

  if (!order) return { ok: false, error: 'الطلب مش موجود' }
  if (order.customer_profile_id !== user.id) return { ok: false, error: 'غير مصرح' }
  if (order.status !== 'delivered') {
    return { ok: false, error: 'التقييم متاح بعد التسليم فقط' }
  }
  if (order.feedback_rating !== null) {
    return { ok: false, error: 'سبق وقيّمت الطلب ده' }
  }

  const { error: updErr } = await supabase
    .from('order_requests')
    .update({
      feedback_rating: parsed.data.rating,
      feedback_issue_type: parsed.data.issue_type ?? null,
      feedback_text: parsed.data.text?.trim() || null,
      feedback_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.orderId)

  if (updErr) return { ok: false, error: 'فشل حفظ التقييم' }

  revalidatePath('/account/orders')
  return { ok: true }
}
