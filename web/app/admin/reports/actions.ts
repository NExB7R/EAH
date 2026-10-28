'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'

type Result = { ok: true } | { ok: false; error: string }

const schema = z.object({
  status: z.enum(['reviewing', 'resolved', 'dismissed']),
  adminNote: z.string().trim().max(500).optional().default(''),
})

export async function updateReportStatus(
  reportId: string,
  status: string,
  adminNote = '',
): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = schema.safeParse({ status, adminNote })
  if (!parsed.success) return { ok: false, error: 'حالة أو بيانات قرار غير صحيحة' }

  const note = parsed.data.adminNote.trim()
  if ((parsed.data.status === 'resolved' || parsed.data.status === 'dismissed') && note.length < 3) {
    return { ok: false, error: 'اكتب سبب قرار الأدمن قبل إغلاق البلاغ' }
  }

  const { data: current, error: readError } = await ctx.supabase
    .from('reports')
    .select('id, status')
    .eq('id', reportId)
    .maybeSingle()
  if (readError) return { ok: false, error: 'تعذر قراءة البلاغ الآن' }
  if (!current) return { ok: false, error: 'البلاغ غير موجود' }
  if (current.status === 'resolved' || current.status === 'dismissed') {
    return { ok: false, error: 'البلاغ اتقفل بالفعل ولا يمكن تغيير قراره من هنا' }
  }
  if (current.status !== 'pending' && current.status !== 'reviewing') {
    return { ok: false, error: 'حالة البلاغ الحالية لا تسمح بالتحديث' }
  }

  const { data: updated, error } = await ctx.supabase
    .from('reports')
    .update({
      status: parsed.data.status,
      reviewed_by: ctx.userId,
      reviewed_at: new Date().toISOString(),
      admin_note: note || null,
    })
    .eq('id', reportId)
    .in('status', ['pending', 'reviewing'])
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[admin-report] update failed:', error.message)
    return { ok: false, error: 'تعذر حفظ قرار البلاغ الآن. حاول مرة أخرى.' }
  }
  if (!updated) return { ok: false, error: 'البلاغ اتغير بواسطة مشرف آخر؛ حدّث الصفحة وراجع الحالة' }

  const { error: auditError } = await ctx.supabase.from('audit_logs').insert({
    actor_user_id: ctx.userId,
    action: 'report.update',
    entity_type: 'report',
    entity_id: reportId,
    metadata: { status: parsed.data.status, admin_note: note || null },
  })
  if (auditError) console.error('[admin-report] audit log insert failed:', auditError.message)

  revalidatePath('/admin/moderation')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}
