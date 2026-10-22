'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Profile Actions
// Simple admin update — name only (avatar via /api/upload/avatar)
// No alias/bio/gender/visibility — those are customer concepts.
// ═══════════════════════════════════════════════════════════

type Result = { ok: true } | { ok: false; error: string }

export async function updateAdminProfile(formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const displayName = String(formData.get('display_name') ?? '').trim()
  if (!displayName) return { ok: false, error: 'الاسم مطلوب' }
  if (displayName.length > 50) return { ok: false, error: 'الاسم أطول من 50 حرف' }

  const { error } = await ctx.supabase
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', ctx.userId)

  if (error) return { ok: false, error: 'فشل الحفظ — حاول تاني' }

  revalidatePath('/admin/profile')
  revalidatePath('/admin')
  return { ok: true }
}
