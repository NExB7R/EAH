'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { FEEDBACK_ISSUE_TYPES } from '@/lib/data/orders'

// ═══════════════════════════════════════════════════════════════════
// Customer feedback on delivered order
// - Idempotent (1 rating per order)
// - Gated by feedback_due_at
// - Inserts audit reaction
// - Stored as private operational feedback on this order.
// - Public activity stars are aggregated only from approved, transaction-verified business_reviews.
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
  if (!user || user.is_anonymous) return { ok: false, error: 'لازم تسجل دخول' }

  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const { data: order } = await supabase
    .from('order_requests')
    .select('id, business_id, status, customer_profile_id, feedback_rating, feedback_due_at')
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
  if (order.feedback_due_at && new Date(order.feedback_due_at).getTime() > Date.now()) {
    return { ok: false, error: 'التقييم متاح بعد فترة قصيرة من التسليم' }
  }

  // Issue type only relevant with low rating
  const issueType =
    parsed.data.rating <= 3 && parsed.data.issue_type ? parsed.data.issue_type : null

  const nowIso = new Date().toISOString()

  const { data: updated, error: updErr } = await supabase
    .from('order_requests')
    .update({
      feedback_rating: parsed.data.rating,
      feedback_issue_type: issueType,
      feedback_text: parsed.data.text?.trim() || null,
      feedback_sent_at: nowIso,
      updated_at: nowIso,
    })
    .eq('id', parsed.data.orderId)
    .eq('status', 'delivered')
    .is('feedback_rating', null)
    .select('id, business_id')
    .maybeSingle()

  if (updErr) return { ok: false, error: 'فشل حفظ التقييم' }
  if (!updated) return { ok: false, error: 'التقييم اتسجل بالفعل' }

  // Audit reaction (non-fatal) — trigger will handle business rating
  const { error: reactionErr } = await supabase.from('order_reactions').insert({
    order_id: parsed.data.orderId,
    actor_type: 'customer',
    actor_id: user.id,
    action: 'feedback_submitted',
    metadata: {
      rating: parsed.data.rating,
      issue_type: issueType,
      has_text: !!(parsed.data.text ?? '').trim(),
    },
  })
  if (reactionErr) {
    console.warn('[order_reactions] feedback insert failed:', reactionErr.message)
  }

  revalidatePath('/account/orders')
  revalidatePath('/admin/orders')
  return { ok: true }
}
