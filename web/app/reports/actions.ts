'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { strictLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'

// ═══════════════════════════════════════════════════════════
// EAH — Reports Actions (Anti-Fraud)
// ═══════════════════════════════════════════════════════════

type Result = { ok: true } | { ok: false; error: string }

const schema = z.object({
  entityType: z.enum(['business', 'review', 'user']),
  entityId: z.string().uuid(),
  reason: z.enum(['spam', 'offensive', 'fake', 'harassment', 'wrong_info', 'other']),
  note: z.string().max(500).optional().or(z.literal('')),
})

const REASON_LABEL: Record<string, string> = {
  spam: 'سبام',
  offensive: 'محتوى مسيء',
  fake: 'محتوى مزيّف',
  harassment: 'تحرش/إساءة',
  wrong_info: 'معلومات غلط',
  other: 'سبب آخر',
}

export async function submitReport(formData: FormData): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول' }

  // Rate limit — 5 بلاغات / 15 دقيقة
  const ip = await getClientIp()
  const rl = await checkRateLimit(strictLimiter, `report:${user.id}:${ip}`, { failClosed: true })
  if (!rl.ok) return { ok: false, error: rl.error }

  const parsed = schema.safeParse({
    entityType: String(formData.get('entityType') ?? ''),
    entityId: String(formData.get('entityId') ?? ''),
    reason: String(formData.get('reason') ?? ''),
    note: String(formData.get('note') ?? '').trim(),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const d = parsed.data

  // مفيش بلاغ مكرر من نفس المستخدم
  const { data: existing } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('entity_type', d.entityType)
    .eq('entity_id', d.entityId)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) return { ok: false, error: 'عندك بلاغ معلّق على المحتوى ده' }

  // ممنوع يبلّغ نفسه
  if (d.entityType === 'user' && d.entityId === user.id) {
    return { ok: false, error: 'مش ممكن تبلّغ عن نفسك' }
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    entity_type: d.entityType,
    entity_id: d.entityId,
    reason: REASON_LABEL[d.reason] ?? d.reason,
    note: d.note || null,
    status: 'pending',
  })

  if (error) return { ok: false, error: error.message }

  return { ok: true }
}
