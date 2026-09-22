'use server'
import { revalidatePath } from 'next/cache'
import { approvePendingChange, rejectPendingChange } from '@/lib/admin/pending'
import { notifyPendingDecision } from '@/lib/admin/pending-notifications'

export async function approveAction(id: string, note: string) {
  const r = await approvePendingChange(id, note || undefined)
  if (!r.ok) {
    const reason = 'reason' in r ? r.reason : undefined
    const msgs: Record<string, string> = {
      not_admin: 'مش عندك صلاحيات',
      not_found_or_not_pending: 'الطلب مش موجود أو اتعالج قبل كده',
    }
    return { ok: false, error: msgs[reason ?? ''] ?? 'فشل' }
  }
  revalidatePath('/admin/pending')
  revalidatePath('/admin/audit')

  try {
    await notifyPendingDecision(id, 'approved', note || undefined)
  } catch {
    // The moderation decision succeeded; push delivery must not roll it back.
  }

  return { ok: true }
}

export async function rejectAction(id: string, note: string) {
  const r = await rejectPendingChange(id, note || undefined)
  if (!r.ok) {
    const reason = 'reason' in r ? r.reason : undefined
    const msgs: Record<string, string> = {
      not_admin: 'مش عندك صلاحيات',
      not_found_or_not_pending: 'الطلب مش موجود أو اتعالج قبل كده',
    }
    return { ok: false, error: msgs[reason ?? ''] ?? 'فشل' }
  }
  revalidatePath('/admin/pending')
  revalidatePath('/admin/audit')

  try {
    await notifyPendingDecision(id, 'rejected', note || undefined)
  } catch {
    // The moderation decision succeeded; push delivery must not roll it back.
  }

  return { ok: true }
}
