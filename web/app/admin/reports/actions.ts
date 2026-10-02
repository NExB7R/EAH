'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { ok: false; error: string }

const schema = z.object({
  status: z.enum(['open', 'reviewing', 'resolved', 'dismissed']),
})

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'غير مصرح' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    return { ok: false as const, error: 'غير مصرح' }
  }
  return { ok: true as const, supabase, userId: user.id }
}

export async function updateReportStatus(reportId: string, status: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const parsed = schema.safeParse({ status })
  if (!parsed.success) return { ok: false, error: 'حالة غير صحيحة' }

  const { error } = await ctx.supabase
    .from('reports')
    .update({ status: parsed.data.status })
    .eq('id', reportId)

  if (error) return { ok: false, error: error.message }

  await ctx.supabase.from('audit_logs').insert({
    actor_user_id: ctx.userId,
    action: 'report.update',
    entity_type: 'report',
    entity_id: reportId,
    metadata: { status: parsed.data.status },
  })

  revalidatePath('/admin/reports')
  return { ok: true }
}
