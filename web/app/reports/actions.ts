'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
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
  if (!user || user.is_anonymous) return { ok: false, error: 'لازم تسجل دخول' }

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

  // Verify the polymorphic target exists before inserting a report.
  const service = createServiceClient()
  let targetExists = false

  if (d.entityType === 'business') {
    const { data } = await service.from('businesses').select('id').eq('id', d.entityId).eq('is_published', true).maybeSingle()
    targetExists = !!data
  } else if (d.entityType === 'review') {
    const { data } = await service.from('business_reviews').select('id, user_id').eq('id', d.entityId).eq('status', 'approved').maybeSingle()
    if (data?.user_id === user.id) return { ok: false, error: 'مش ممكن تبلّغ عن تقييمك أنت' }
    targetExists = !!data
  } else {
    const { data } = await service.from('profiles').select('id').eq('id', d.entityId).maybeSingle()
    targetExists = !!data
  }

  if (!targetExists) return { ok: false, error: 'المحتوى اللي بتحاول تبلغ عنه مش متاح' }

  // One report per reporter and entity; the DB unique index also protects against concurrent submissions.
  const { data: existing } = await supabase.from('reports').select('id').eq('reporter_id', user.id)
    .eq('entity_type', d.entityType).eq('entity_id', d.entityId).maybeSingle()
  if (existing) return { ok: false, error: 'سبق وقدّمت بلاغ على المحتوى ده' }

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

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'سبق وقدّمت بلاغ على المحتوى ده' }
    console.error('[report] insert failed:', error.message)
    return { ok: false, error: 'تعذر إرسال البلاغ الآن. حاول مرة أخرى.' }
  }

  return { ok: true }
}
