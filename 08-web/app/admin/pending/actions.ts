'use server'
import { revalidatePath } from 'next/cache'
import { approvePendingChange, rejectPendingChange } from '@/lib/admin/pending'

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

  // notify merchant
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/admin/pending/notify-merchant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pendingId: id, status: 'approved', note }),
    })
  } catch { /* silent */ }

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

  // notify merchant
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/admin/pending/notify-merchant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pendingId: id, status: 'rejected', note }),
    })
  } catch { /* silent */ }

  return { ok: true }
}
